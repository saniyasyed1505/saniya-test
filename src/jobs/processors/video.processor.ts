import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../../ai/ai.service';
import { StorageService } from '../../storage/storage.service';
import { Logger } from '@nestjs/common';
import { GenerationStatus } from '@prisma/client';

@Processor('video-generation')
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private storageService: StorageService,
  ) {
    super();
  }

  async process(job: Job<{ generationId: string }>): Promise<any> {
    const { generationId } = job.data;
    this.logger.log(`Processing video-generation job ${job.id} for generation ID: ${generationId}`);

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
        retries: job.attemptsMade,
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
      const aiResult = await this.aiService.generateVideo(generation.prompt, generation.model);
      await this.prisma.job.update({
        where: { id: dbJob.id },
        data: { providerJobId: aiResult.providerJobId },
      });

      // Poll status if the job is asynchronous (starts in PROCESSING)
      let statusResult = aiResult;
      let checkAttempts = 0;
      const maxChecks = 45; // 45 attempts * 2s = 90s timeout

      while (statusResult.status === 'PROCESSING' && checkAttempts < maxChecks) {
        this.logger.log(`AI job ${aiResult.providerJobId} still processing, waiting 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        statusResult = await this.aiService.checkStatus(aiResult.providerJobId);
        checkAttempts++;
      }

      if (statusResult.status !== 'COMPLETED' || !statusResult.mediaUrl) {
        throw new Error(statusResult.error || 'Video generation failed or timed out on AI provider.');
      }

      // Download generated video to Buffer
      this.logger.log(`Downloading generated asset from AI provider: ${statusResult.mediaUrl}`);
      const downloadResponse = await fetch(statusResult.mediaUrl);
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download video from AI provider: ${downloadResponse.statusText}`);
      }

      const arrayBuffer = await downloadResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = downloadResponse.headers.get('Content-Type') || 'video/mp4';
      const extension = contentType.split('/')[1] || 'mp4';
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

      this.logger.log(`Successfully completed video generation ${generationId}. URL: ${finalUrl}`);
      return { success: true, mediaUrl: finalUrl };
    } catch (error: any) {
      const errMsg = error.message || 'Unknown processing error';
      this.logger.error(`Failed to process video generation job ${job.id} for generation ID ${generationId}: ${errMsg}`, error.stack);

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
          retries: job.attemptsMade + 1,
        },
      });

      throw error; // Let BullMQ retry the job
    }
  }
}
