import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIProviderResult, AICheckStatusResult } from './providers/ai-provider.interface';
import { PollinationsProvider } from './providers/pollinations.provider';
import { PixabayProvider } from './providers/pixabay.provider';

@Injectable()
export class AIService implements OnModuleInit {
  private imageProvider!: AIProvider;
  private videoProvider!: AIProvider;
  private readonly logger = new Logger(AIService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.logger.log('Initializing AIService with Pixabay (Images) and Pollinations.ai (Video)');
    this.imageProvider = new PixabayProvider();
    this.videoProvider = new PollinationsProvider();
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    // We now use Pixabay to fetch real stock photos instead of generating AI images
    return this.imageProvider.generateImage(prompt, model);
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    return this.videoProvider.generateVideo(prompt, model);
  }

  async generateGif(prompt: string, model: string): Promise<AIProviderResult> {
    if (this.videoProvider.generateGif) {
      return this.videoProvider.generateGif(prompt, model);
    }
    return this.videoProvider.generateVideo(prompt, model); 
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    return this.videoProvider.checkStatus(providerJobId); // Pollinations handles video status
  }
}
