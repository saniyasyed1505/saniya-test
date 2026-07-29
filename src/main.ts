import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Security Config (Helmet & CORS)
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP if you need to browse Swagger documentation easily
    crossOriginResourcePolicy: false, // Allow frontend to load images cross-origin
  }));
  app.enableCors();

  // 2. Serve public folder statically (for local developer storage fallback)
  app.use('/public', express.static(join(process.cwd(), 'public')));

  // 3. Global Pipes (Validation with class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 5. Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Image & Video Generation SaaS API')
    .setDescription('Comprehensive backend API for user registration, authentication, and asynchronous image/video generations.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Startup
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`OpenAPI documentation details at: http://localhost:${port}/api/docs`);
}
bootstrap();
