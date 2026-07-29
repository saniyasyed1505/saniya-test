import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIProviderResult, AICheckStatusResult } from './providers/ai-provider.interface';
import { PollinationsProvider } from './providers/pollinations.provider';

@Injectable()
export class AIService implements OnModuleInit {
  private provider!: AIProvider;
  private readonly logger = new Logger(AIService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.logger.log('Initializing AIService with Pollinations.ai provider');
    this.provider = new PollinationsProvider();
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    return this.provider.generateImage(prompt, model);
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    return this.provider.generateVideo(prompt, model);
  }

  async generateGif(prompt: string, model: string): Promise<AIProviderResult> {
    if (this.provider.generateGif) {
      return this.provider.generateGif(prompt, model);
    }
    return this.provider.generateVideo(prompt, model); // fallback to video if generateGif not implemented
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    return this.provider.checkStatus(providerJobId);
  }
}
