export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_saas?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-access-token-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-change-in-production',
    accessExpiration: '7d',
    refreshExpiration: '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    s3: {
      bucket: process.env.S3_BUCKET || 'my-ai-saas-bucket',
      region: process.env.S3_REGION || 'us-east-1',
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || '',
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
});
