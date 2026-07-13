import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';
import { AIModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'image-generation' },
      { name: 'video-generation' }
    ),
    AIModule,
    StorageModule,
  ],
  providers: [JobsService, ImageProcessor, VideoProcessor],
  exports: [JobsService],
})
export class JobsModule {}
