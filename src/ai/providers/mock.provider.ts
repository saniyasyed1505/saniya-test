import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';
import { Logger } from '@nestjs/common';

export class MockAIProvider implements AIProvider {
  private readonly logger = new Logger(MockAIProvider.name);

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`MockAI: Simulating image generation queue for prompt: "${prompt}"`);
    const jobId = `mock-img-job-${Date.now()}`;
    return {
      providerJobId: jobId,
      status: 'PROCESSING',
    };
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`MockAI: Simulating video generation queue for prompt: "${prompt}"`);
    const jobId = `mock-vid-job-${Date.now()}`;
    return {
      providerJobId: jobId,
      status: 'PROCESSING',
    };
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    this.logger.log(`MockAI: Checking status for job: ${providerJobId}`);
    
    // Simulate generation work by sleeping for 1.5 seconds in the check
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (providerJobId.includes('img')) {
      return {
        status: 'COMPLETED',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
      };
    } else {
      return {
        status: 'COMPLETED',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
      };
    }
  }
}
