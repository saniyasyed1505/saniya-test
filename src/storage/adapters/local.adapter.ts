import { StorageAdapter } from './storage-adapter.interface';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private baseDir: string;

  constructor() {
    // Resolve standard local upload directory under public/uploads in workspace
    this.baseDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filePath: string, mimeType: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.logger.log(`Writing file to local storage: ${fullPath}`);
    await fs.promises.writeFile(fullPath, file);
    return this.getUrl(filePath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    if (fs.existsSync(fullPath)) {
      this.logger.log(`Deleting file from local storage: ${fullPath}`);
      await fs.promises.unlink(fullPath);
    }
  }

  async getUrl(filePath: string): Promise<string> {
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}/public/uploads/${filePath}`;
  }
}
