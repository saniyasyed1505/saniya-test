import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../../ai/ai.service';
import { StorageService } from '../../storage/storage.service';
import { GenerationStatus } from '@prisma/client';

@Injectable()
export class ImageProcessor {
  private readonly logger = new Logger(ImageProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private storageService: StorageService,
  ) {}

  async process(generationId: string): Promise<any> {
    this.logger.log(`Processing image-generation job for generation ID: ${generationId}`);

    const generation = await this.prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      this.logger.error(`Generation record ${generationId} not found in database.`);
      return;
    }

    // Register job tracking record
    const dbJob = await this.prisma.job.create({
      data: {
        generationId,
        provider: 'unknown',
        status: 'PROCESSING',
        retries: 0,
      },
    });

    try {
      // Update generation status to PROCESSING
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: GenerationStatus.PROCESSING },
      });

      const providerName = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key-for-local-testing' ? 'openai' : 'mock';
      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: { provider: providerName },
      });

      // Request generation from AI Service
      const aiResult = await this.aiService.generateImage(generation.prompt, generation.model);
      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: { providerJobId: aiResult.providerJobId },
      });

      // Poll status if the job is asynchronous (starts in PROCESSING)
      let statusResult = aiResult;
      let checkAttempts = 0;
      const maxChecks = 30; // 30 attempts * 2s = 60s timeout

      while (statusResult.status === 'PROCESSING' && checkAttempts < maxChecks) {
        this.logger.log(`AI job ${aiResult.providerJobId} still processing, waiting 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        statusResult = await this.aiService.checkStatus(aiResult.providerJobId);
        checkAttempts++;
      }

      if (statusResult.status !== 'COMPLETED' || !statusResult.mediaUrl) {
        throw new Error(statusResult.error || 'Image generation failed or timed out on AI provider.');
      }

      // Download generated image to Buffer
      this.logger.log(`Downloading generated asset from AI provider: ${statusResult.mediaUrl}`);
      const downloadResponse = await fetch(statusResult.mediaUrl);
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download image from AI provider: ${downloadResponse.statusText}`);
      }

      const arrayBuffer = await downloadResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = downloadResponse.headers.get('Content-Type') || 'image/png';
      const extension = contentType.split('/')[1] || 'png';
      const storagePath = `generations/${generation.userId}/${generationId}.${extension}`;

      // Upload to target Storage Service
      this.logger.log(`Uploading asset to storage: ${storagePath}`);
      const finalUrl = await this.storageService.upload(buffer, storagePath, contentType);

      // Update generation and job state to COMPLETED
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.COMPLETED,
          mediaUrl: finalUrl,
          thumbnailUrl: finalUrl,
        },
      });

      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: { status: 'COMPLETED' },
      });

      this.logger.log(`Successfully completed image generation ${generationId}. URL: ${finalUrl}`);
      return { success: true, mediaUrl: finalUrl };
    } catch (error: any) {
      let errMsg = error.message || 'Unknown processing error';
      let errorCategory = 'UNKNOWN_ERROR';
      
      if (errMsg.includes('timed out')) {
        errorCategory = 'TIMEOUT';
      } else if (errMsg.includes('Replicate API error: 429') || errMsg.includes('Too Many Requests')) {
        errorCategory = 'RATE_LIMIT';
      } else if (errMsg.includes('fetch failed') || errMsg.includes('ECONNREFUSED') || errMsg.includes('Failed to download')) {
        errorCategory = 'NETWORK_ERROR';
      } else if (errMsg.includes('Replicate API error') || errMsg.includes('AI provider')) {
        errorCategory = 'API_ERROR';
      }

      const finalErrMsg = `${errorCategory}: ${errMsg}`;
      this.logger.error(`Failed to process image generation job for generation ID ${generationId}: ${finalErrMsg}`, error.stack);

      // Update DB state to FAILED
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage: errMsg,
        },
      });

      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: {
          status: 'FAILED',
          retries: 1,
        },
      });

      throw error; // Let BullMQ retry the job
    }
  }
}
