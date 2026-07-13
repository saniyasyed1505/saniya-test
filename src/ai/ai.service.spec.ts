import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';

describe('AIService', () => {
  let service: AIService;
  let configService: jest.Mocked<any>;

  const createModule = async (apiKey: string) => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'openai.apiKey') return apiKey;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    configService = module.get(ConfigService);
    service.onModuleInit();
  };

  it('should fallback to Mock provider when api key is mock', async () => {
    await createModule('mock-key-for-local-testing');
    
    const result = await service.generateImage('test prompt', 'mock-model');
    expect(result.providerJobId).toContain('mock-img');
    expect(result.status).toEqual('PROCESSING');
  });

  it('should fallback to Mock provider when api key is empty', async () => {
    await createModule('');
    
    const result = await service.generateImage('test prompt', 'mock-model');
    expect(result.providerJobId).toContain('mock-img');
  });

  it('should use OpenAI provider when a valid api key is present', async () => {
    await createModule('sk-valid-key-value-here');
    
    const globalFetch = global.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [{ url: 'https://openai-generated-image.com/img.png' }],
      }),
    });
    global.fetch = mockFetch;

    const result = await service.generateImage('sunset', 'dall-e-3');
    expect(result.providerJobId).toContain('openai-img');
    expect(result.status).toEqual('COMPLETED');
    expect(result.mediaUrl).toEqual('https://openai-generated-image.com/img.png');

    global.fetch = globalFetch; // Restore global state
  });
});
