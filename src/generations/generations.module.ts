import { Module } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { GenerationsController } from './generations.controller';
import { JobsModule } from '../jobs/jobs.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [JobsModule, StorageModule],
  controllers: [GenerationsController],
  providers: [GenerationsService],
  exports: [GenerationsService],
})
export class GenerationsModule {}
