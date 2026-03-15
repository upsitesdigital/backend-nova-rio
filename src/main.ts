import { timingSafeEqual } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

const REQUIRED_SECRETS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'VINDI_API_KEY',
  'VINDI_WEBHOOK_SECRET',
  'CORS_ORIGIN',
] as const;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  const missing = REQUIRED_SECRETS.filter((key) => !configService.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

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
      '/api/docs',
      (
        req: { headers: { authorization?: string } },
        res: {
          setHeader: (key: string, value: string) => void;
          status: (code: number) => { end: () => void };
        },
        next: () => void,
      ) => {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Basic ')) {
          res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
          res.status(401).end();
          return;
        }
        const decoded = Buffer.from(auth.slice(6), 'base64').toString();
        const [user, pass] = decoded.split(':');
        if (
          !user ||
          !pass ||
          !safeCompare(user, swaggerUser) ||
          !safeCompare(pass, swaggerPassword)
        ) {
          res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
          res.status(401).end();
          return;
        }
        next();
      },
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
