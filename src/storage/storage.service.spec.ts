import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

describe('StorageService', () => {
  let service: StorageService;
  let configService: jest.Mocked<any>;

  const createModule = async (provider: string) => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'storage.provider') return provider;
        if (key === 'storage.s3.bucket') return 'test-bucket';
        if (key === 'storage.s3.region') return 'us-east-1';
        if (key === 'storage.s3.accessKey') return 'test-access';
        if (key === 'storage.s3.secretKey') return 'test-secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    configService = module.get(ConfigService);
    service.onModuleInit();
  };

  it('should initialize with LocalStorageAdapter when provider is local', async () => {
    await createModule('local');
    const url = await service.getUrl('path/to/file.png');
    expect(url).toContain('http://localhost:');
    expect(url).toContain('/public/uploads/path/to/file.png');
  });

  it('should initialize with S3StorageAdapter when provider is s3', async () => {
    await createModule('s3');
    const url = await service.getUrl('path/to/file.png');
    expect(url).toEqual('https://test-bucket.s3.us-east-1.amazonaws.com/path/to/file.png');
  });
});
