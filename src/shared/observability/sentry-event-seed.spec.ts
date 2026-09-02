import * as Sentry from '@sentry/nestjs';
import { AppLogger } from './app-logger.service.js';
import { SentryEventSanitizer } from './sentry-event-sanitizer.js';

const dsn = process.env.SENTRY_DSN;

/**
 * Sends one real event through AppLogger to prove the wiring end to end.
 *
 * Skipped unless SENTRY_DSN is exported, so CI never ships noise to the project.
 * Run it with: SENTRY_DSN="$(grep '^SENTRY_DSN=' .env | cut -d= -f2- | tr -d '"')" npx vitest run src/shared/observability/sentry-event-seed.spec.ts
 */
describe.skipIf(!dsn)('Sentry event seed', () => {
  it('delivers a tagged event to the configured project', async () => {
    Sentry.init({
      dsn,
      environment: 'setup-check',
      tracesSampleRate: 0,
      sendDefaultPii: false,
      beforeSend: (event) => SentryEventSanitizer.sanitize(event),
    });

    new AppLogger().error('Payments.chargeCard() gateway timed out', {
      error: new Error('gateway timed out'),
    });

    await expect(Sentry.flush(20_000)).resolves.toBe(true);
  }, 30_000);
});
