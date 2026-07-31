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
    this.logger.log('Initializing AIService with Pollinations.ai');
    this.provider = new PollinationsProvider();
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    // Ignore whatever model the frontend sends and FORCE 'turbo' 
    // because FLUX models (like flux and flux-pro) have strict safety filters 
    // that deliberately scramble celebrity faces to prevent deepfakes.
    const targetModel = 'turbo';
    return this.provider.generateImage(prompt, targetModel);
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
