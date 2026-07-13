import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter } from './adapters/storage-adapter.interface';
import { LocalStorageAdapter } from './adapters/local.adapter';
import { S3StorageAdapter } from './adapters/s3.adapter';

@Injectable()
export class StorageService implements OnModuleInit {
  private adapter: StorageAdapter;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const provider = this.configService.get<string>('storage.provider') || 'local';
    this.logger.log(`Initializing storage service with provider: ${provider}`);

    if (provider.toLowerCase() === 's3' || provider.toLowerCase() === 'r2') {
      const bucket = this.configService.get<string>('storage.s3.bucket') || 'my-ai-saas-bucket';
      const region = this.configService.get<string>('storage.s3.region') || 'us-east-1';
      const accessKey = this.configService.get<string>('storage.s3.accessKey') || '';
      const secretKey = this.configService.get<string>('storage.s3.secretKey') || '';
      
      // Compute Cloudflare R2 S3 endpoint if custom endpoint is required
      const endpoint = this.configService.get<string>('storage.s3.endpoint');

      this.adapter = new S3StorageAdapter({
        bucket,
        region,
        accessKey,
        secretKey,
        endpoint,
      });
    } else {
      this.adapter = new LocalStorageAdapter();
    }
  }

  async upload(file: Buffer, path: string, mimeType: string): Promise<string> {
    return this.adapter.upload(file, path, mimeType);
  }

  async delete(path: string): Promise<void> {
    return this.adapter.delete(path);
  }

  async getUrl(path: string): Promise<string> {
    return this.adapter.getUrl(path);
  }
}
