import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../../ai/ai.service';
import { StorageService } from '../../storage/storage.service';
import { GenerationStatus } from '@prisma/client';

@Injectable()
export class MemeProcessor {
  private readonly logger = new Logger(MemeProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private storageService: StorageService,
  ) {}

  async process(generationId: string): Promise<any> {
    this.logger.log(`Processing meme-generation job for generation ID: ${generationId}`);

    const generation = await this.prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      this.logger.error(`Generation record ${generationId} not found in database.`);
      return;
    }

    const dbJob = await this.prisma.job.create({
      data: {
        generationId,
        provider: 'pollinations',
        status: 'PROCESSING',
        retries: 0,
      },
    });

    try {
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: GenerationStatus.PROCESSING },
      });

      const memeDataConfig: any = generation.memeData || {};
      const { mode, template } = memeDataConfig;

      // 1. Generate text
      this.logger.log(`Generating meme text for prompt: ${generation.prompt}`);
      
      const systemPrompt = `You are a viral meme creator.
Generate memes exactly like those trending on TikTok, Instagram Reels, and Twitter.
Use current Gen Z humor (e.g. bro, fr, nah, 😭, 💀, 🙏, cooked, it's giving, delulu, npc, aura, locked in, brainrot, W, L, goated, lowkey, highkey, canon event, type shi, chat, unc, bussin, mid, standing on business, crash out).
Use slang only when it naturally improves the joke. DO NOT randomly insert slang.
Keep the joke short and relatable. Avoid offensive content.
Return JSON only.
Include an "imagePrompt" to describe the visual scene of the meme.
JSON schema:
{
  "type": "caption",
  "title": "...",
  "text": "...",
  "memeTemplate": "${template || 'random'}",
  "imagePrompt": "..."
}`;

      let generatedMeme: any;
      try {
        const textRes = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Mode: ${mode}. Context: ${generation.prompt}` }
            ],
            model: 'openai',
            jsonMode: true
          })
        });

        if (!textRes.ok) {
          throw new Error(`Pollinations text API failed: ${textRes.statusText}`);
        }

        generatedMeme = await textRes.json();
      } catch (err: any) {
        this.logger.warn(`AI Text generation failed, using fallback meme. Error: ${err.message}`);
        generatedMeme = {
          type: "caption",
          title: "Relatable Moment",
          text: generation.prompt.length > 20 ? generation.prompt : `When ${generation.prompt} 💀`,
          memeTemplate: template || "Random",
          imagePrompt: generation.prompt
        };
      }
      this.logger.log(`Meme text generated: ${JSON.stringify(generatedMeme)}`);

      let finalMediaUrl: string | null = null;

      // 2. Generate Media based on Mode
      if (mode === 'Image' && generatedMeme.imagePrompt) {
        this.logger.log(`Generating image for meme...`);
        const cleanImagePrompt = generatedMeme.imagePrompt + ", highly detailed, realistic, photography, NO TEXT, textless, do not include any words or letters in the image";
        const aiResult = await this.aiService.generateImage(cleanImagePrompt, generation.model);
        
        let statusResult = aiResult;
        let checkAttempts = 0;
        const maxChecks = 30;

        while (statusResult.status === 'PROCESSING' && checkAttempts < maxChecks) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          statusResult = await this.aiService.checkStatus(aiResult.providerJobId);
          checkAttempts++;
        }

        if (statusResult.status !== 'COMPLETED' || !statusResult.mediaUrl) {
          throw new Error(statusResult.error || 'Image generation failed');
        }

        const downloadResponse = await fetch(statusResult.mediaUrl);
        if (!downloadResponse.ok) throw new Error('Failed to download image');
        
        const arrayBuffer = await downloadResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = downloadResponse.headers.get('Content-Type') || 'image/png';
        const extension = contentType.split('/')[1] || 'png';
        const storagePath = `generations/${generation.userId}/${generationId}.${extension}`;

        finalMediaUrl = await this.storageService.upload(buffer, storagePath, contentType);
      } else if (mode === 'GIF' && generatedMeme.imagePrompt) {
        this.logger.log(`Generating 3-second GIF/Video for meme...`);
        const cleanImagePrompt = generatedMeme.imagePrompt + ", high quality, no text";
        const aiResult = await this.aiService.generateGif(cleanImagePrompt, generation.model);
        
        if (aiResult.status !== 'COMPLETED' || !aiResult.mediaUrl) {
          throw new Error(aiResult.error || 'GIF generation failed');
        }

        const downloadResponse = await fetch(aiResult.mediaUrl);
        if (!downloadResponse.ok) throw new Error('Failed to download GIF');
        
        const arrayBuffer = await downloadResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = downloadResponse.headers.get('Content-Type') || 'video/mp4';
        const extension = contentType.split('/')[1] || 'mp4';
        const storagePath = `generations/${generation.userId}/${generationId}.${extension}`;

        finalMediaUrl = await this.storageService.upload(buffer, storagePath, contentType);
      }

      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.COMPLETED,
          mediaUrl: finalMediaUrl,
          thumbnailUrl: finalMediaUrl,
          memeData: { ...generatedMeme, mode }
        },
      });

      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: { status: 'COMPLETED' },
      });

      this.logger.log(`Successfully completed meme generation ${generationId}.`);
    } catch (error: any) {
      let errMsg = error.message || 'Unknown processing error';
      let errorCategory = 'UNKNOWN_ERROR';
      
      if (errMsg.includes('timed out')) {
        errorCategory = 'TIMEOUT';
      } else if (errMsg.includes('Replicate API error: 429') || errMsg.includes('Too Many Requests') || errMsg.includes('429')) {
        errorCategory = 'RATE_LIMIT';
      } else if (errMsg.includes('fetch failed') || errMsg.includes('ECONNREFUSED') || errMsg.includes('Failed to download')) {
        errorCategory = 'NETWORK_ERROR';
      } else if (errMsg.includes('Replicate API error') || errMsg.includes('AI provider') || errMsg.includes('Failed to generate text')) {
        errorCategory = 'API_ERROR';
      }

      const finalErrMsg = `${errorCategory}: ${errMsg}`;
      this.logger.error(`Meme processing failed for generation ${generationId}: ${finalErrMsg}`);
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage: finalErrMsg,
        },
      });

      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: {
          status: 'FAILED',
        },
      });
    }
  }
}
