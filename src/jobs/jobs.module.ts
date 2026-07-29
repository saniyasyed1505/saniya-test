import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';
import { MemeProcessor } from './processors/meme.processor';
import { AIModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    AIModule,
    StorageModule,
    PrismaModule,
  ],
  providers: [JobsService, ImageProcessor, VideoProcessor, MemeProcessor],
  exports: [JobsService],
})
export class JobsModule {}
