import { SecretStrength } from './secret-strength.js';

export class RequiredSecrets {
  static readonly keys = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP2GO_HOST',
    'SMTP2GO_PORT',
    'SMTP2GO_USER',
    'SMTP2GO_PASS',
    'SMTP2GO_FROM_EMAIL',
    'VINDI_API_KEY',
    'VINDI_WEBHOOK_USER',
    'VINDI_WEBHOOK_PASSWORD',
    'CORS_ORIGIN',
  ] as const;

  private static readonly strengthKeys = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'VINDI_WEBHOOK_PASSWORD',
  ] as const;

  static validateStrength(get: (key: string) => string | undefined): void {
    for (const key of RequiredSecrets.strengthKeys) {
      SecretStrength.assertStrong(key, get(key) ?? '');
    }
  }
}
