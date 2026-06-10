import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { RequiredSecrets } from './config/required-secrets.js';
import { SwaggerBasicAuth } from './config/swagger-basic-auth.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  const missing = RequiredSecrets.keys.filter((key) => !configService.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  RequiredSecrets.validateStrength((key) => configService.get<string>(key));

  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: false,
  });
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  if (configService.get('ENABLE_SWAGGER') === 'true') {
    const swaggerUser = configService.getOrThrow<string>('SWAGGER_USER');
    const swaggerPassword = configService.getOrThrow<string>('SWAGGER_PASSWORD');

    app.use(
      ['/api/docs', '/api/docs-json', '/api/docs-yaml'],
      SwaggerBasicAuth.create(swaggerUser, swaggerPassword),
    );

    const config = new DocumentBuilder()
      .setTitle('Nova Rio API')
      .setDescription('Nova Rio Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(configService.get<number>('PORT', 3000));
}
void bootstrap();
