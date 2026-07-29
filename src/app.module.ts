import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AIModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './jobs/jobs.module';
import { GenerationsModule } from './generations/generations.module';
import { HistoryModule } from './history/history.module';
import { AdminModule } from './admin/admin.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    // Load config globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Setup connection for BullMQ processors and queues (REMOVED REDIS DEPENDENCY)
    // Core and Feature modules
    PrismaModule,
    AuthModule,
    UsersModule,
    AIModule,
    StorageModule,
    JobsModule,
    GenerationsModule,
    HistoryModule,
    AdminModule,
    ShareModule,
  ],
})
export class AppModule {}
