import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';
import { Logger } from '@nestjs/common';

export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`OpenAI: Requesting image generation for prompt "${prompt}" with model "${model}"`);
    try {
      if (!this.apiKey || this.apiKey === 'mock-key-for-local-testing') {
        this.logger.warn('OpenAI API Key not set. Simulating generation.');
        return {
          providerJobId: `openai-sim-img-${Date.now()}`,
          status: 'COMPLETED',
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
        };
      }

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${errText}`);
      }

      const data = await response.json() as any;
      const mediaUrl = data?.data?.[0]?.url;

      if (!mediaUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      return {
        providerJobId: `openai-img-${Date.now()}`,
        status: 'COMPLETED',
        mediaUrl,
      };
    } catch (err: any) {
      this.logger.error('OpenAI image generation failed', err.stack);
      return {
        providerJobId: `openai-img-fail-${Date.now()}`,
        status: 'FAILED',
        error: err.message,
      };
    }
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.warn('OpenAI: Video generation is not natively supported. Returning standard sample video.');
    return {
      providerJobId: `openai-sim-vid-${Date.now()}`,
      status: 'COMPLETED',
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    };
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    return {
      status: 'COMPLETED',
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    };
  }
}
