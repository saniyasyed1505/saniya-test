import { StorageAdapter } from './storage-adapter.interface';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';

export class S3StorageAdapter implements StorageAdapter {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private endpoint?: string;
  private readonly logger = new Logger(S3StorageAdapter.name);

  constructor(config: {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
    endpoint?: string;
  }) {
    this.bucket = config.bucket;
    this.region = config.region;
    this.endpoint = config.endpoint;

    const s3Config: any = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    };

    if (config.endpoint) {
      s3Config.endpoint = config.endpoint;
      s3Config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(s3Config);
  }

  async upload(file: Buffer, path: string, mimeType: string): Promise<string> {
    try {
      this.logger.log(`Uploading file to S3/R2 bucket ${this.bucket}: ${path}`);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: path,
          Body: file,
          ContentType: mimeType,
        }),
      );
      return this.getUrl(path);
    } catch (error: any) {
      this.logger.error(`S3/R2 upload failed for path: ${path}`, error?.stack);
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from S3/R2 bucket ${this.bucket}: ${path}`);
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: path,
        }),
      );
    } catch (error: any) {
      this.logger.error(`S3/R2 delete failed for path: ${path}`, error?.stack);
      throw error;
    }
  }

  async getUrl(path: string): Promise<string> {
    if (this.endpoint) {
      // Custom endpoint (e.g. Cloudflare R2, LocalStack, MinIO)
      return `${this.endpoint}/${this.bucket}/${path}`;
    }
    // Default AWS S3 URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}
