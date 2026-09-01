// ConfigModule only loads `.env` once Nest boots, long after this file runs.
import 'dotenv/config';

import * as Sentry from '@sentry/nestjs';
import { SentryEventSanitizer } from './shared/observability/sentry-event-sanitizer.js';

const configuredSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE?.trim();
const parsedSampleRate = Number(configuredSampleRate);

// Must be imported before any other module so Sentry can instrument them.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate:
    configuredSampleRate && Number.isFinite(parsedSampleRate) ? parsedSampleRate : 0.1,
  // Ships Nest's Logger output as structured logs, so an issue carries the lines around it.
  enableLogs: true,
  // Nest's ConsoleLogger only ever calls console.error and console.log: warn goes out as log,
  // so capturing 'log' too would drag every boot/info line along. Errors are the signal here.
  integrations: [Sentry.consoleLoggingIntegration({ levels: ['error'] })],
  // This API handles CPF, card and client data: never let the SDK collect it automatically.
  sendDefaultPii: false,
  beforeSend: (event) => SentryEventSanitizer.sanitize(event),
  beforeSendLog: (log) => SentryEventSanitizer.sanitizeLog(log),
});
