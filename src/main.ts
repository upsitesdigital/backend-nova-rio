// Import this first: Sentry must instrument the app before anything else loads.
import './instrument.js';

import { ConsoleLogger, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { RequiredSecrets } from './config/required-secrets.js';
import { SecretStrength } from './config/secret-strength.js';
import { SwaggerBasicAuth } from './config/swagger-basic-auth.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    // Nest writes to stdout directly unless forced through console; Sentry hooks console.
    logger: new ConsoleLogger({ forceConsole: true }),
  });
  const configService = app.get(ConfigService);

  const missing = RequiredSecrets.keys.filter((key) => !configService.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  RequiredSecrets.validateStrength((key) => configService.get<string>(key));

  const logger = new Logger('Bootstrap');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: configService
      .getOrThrow<string>('CORS_ORIGIN')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: false,
  });
  app.enableShutdownHooks();

  if (configService.get('ENABLE_SWAGGER') === 'true') {
    const swaggerUser = configService.getOrThrow<string>('SWAGGER_USER');
    const swaggerPassword = configService.getOrThrow<string>('SWAGGER_PASSWORD');

    // Swagger exposes the full API surface — never serve it with weak credentials.
    SecretStrength.assertStrong('SWAGGER_PASSWORD', swaggerPassword);

    if (isProduction) {
      logger.warn(
        'Swagger is ENABLED in production. Ensure it is restricted to a private network/VPN.',
      );
    }

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
    SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document));
  }

  await app.listen(configService.get<number>('PORT', 3000));
}
void bootstrap();
