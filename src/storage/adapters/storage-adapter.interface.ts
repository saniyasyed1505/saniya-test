export interface StorageAdapter {
  upload(file: Buffer, path: string, mimeType: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}
