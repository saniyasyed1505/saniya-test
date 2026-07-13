export interface AIProviderResult {
  providerJobId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  mediaUrl?: string;
  error?: string;
}

export interface AICheckStatusResult {
  providerJobId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  mediaUrl?: string;
  error?: string;
}

export interface AIProvider {
  generateImage(prompt: string, model: string): Promise<AIProviderResult>;
  generateVideo(prompt: string, model: string): Promise<AIProviderResult>;
  checkStatus(providerJobId: string): Promise<AICheckStatusResult>;
}
