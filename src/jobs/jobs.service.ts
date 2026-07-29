import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';
import { MemeProcessor } from './processors/meme.processor';
import { PrismaService } from '../prisma/prisma.service';
import { GenerationStatus } from '@prisma/client';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private imageProcessor: ImageProcessor,
    private videoProcessor: VideoProcessor,
    private memeProcessor: MemeProcessor,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Cleaning up stalled generation jobs from previous sessions...');
    const result = await this.prisma.generation.updateMany({
      where: {
        status: { in: [GenerationStatus.QUEUED, GenerationStatus.PROCESSING] }
      },
      data: {
        status: GenerationStatus.FAILED
      }
    });
    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} stuck generation(s) as FAILED.`);
    }
  }

  async queueImageGeneration(generationId: string): Promise<void> {
    this.logger.log(`Executing image-generation job directly for generation: ${generationId}`);
    // Execute asynchronously in background without awaiting
    this.imageProcessor.process(generationId).catch(err => {
      this.logger.error(`Background image processing failed: ${err.message}`);
    });
  }

  async queueVideoGeneration(generationId: string): Promise<void> {
    this.logger.log(`Executing video-generation job directly for generation: ${generationId}`);
    // Execute asynchronously in background without awaiting
    this.videoProcessor.process(generationId).catch(err => {
      this.logger.error(`Background video processing failed: ${err.message}`);
    });
  }

  async queueMemeGeneration(generationId: string): Promise<void> {
    this.logger.log(`Executing meme-generation job directly for generation: ${generationId}`);
    this.memeProcessor.process(generationId).catch(err => {
      this.logger.error(`Background meme processing failed: ${err.message}`);
    });
  }
}
