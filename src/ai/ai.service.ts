import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIProviderResult, AICheckStatusResult } from './providers/ai-provider.interface';
import { MockAIProvider } from './providers/mock.provider';
import { OpenAIProvider } from './providers/openai.provider';

@Injectable()
export class AIService implements OnModuleInit {
  private provider!: AIProvider;
  private readonly logger = new Logger(AIService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('openai.apiKey');
    
    // Choose provider based on key presence
    if (apiKey && apiKey !== 'mock-key-for-local-testing' && apiKey.trim() !== '') {
      this.logger.log('Initializing AIService with OpenAI provider');
      this.provider = new OpenAIProvider(apiKey);
    } else {
      this.logger.log('No active OpenAI API key detected. Initializing with Mock AI provider');
      this.provider = new MockAIProvider();
    }
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    return this.provider.generateImage(prompt, model);
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    return this.provider.generateVideo(prompt, model);
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    return this.provider.checkStatus(providerJobId);
  }
}
