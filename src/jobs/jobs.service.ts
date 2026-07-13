import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('image-generation') private imageQueue: Queue,
    @InjectQueue('video-generation') private videoQueue: Queue,
  ) {}

  async queueImageGeneration(generationId: string): Promise<void> {
    this.logger.log(`Enqueueing image-generation job for generation: ${generationId}`);
    await this.imageQueue.add(
      'generate-image',
      { generationId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5s, 10s, 20s...
        },
      },
    );
  }

  async queueVideoGeneration(generationId: string): Promise<void> {
    this.logger.log(`Enqueueing video-generation job for generation: ${generationId}`);
    await this.videoQueue.add(
      'generate-video',
      { generationId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}
