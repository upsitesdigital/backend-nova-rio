import { SecretStrength } from './secret-strength.js';

export class RequiredSecrets {
  static readonly keys = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'VINDI_API_KEY',
    'VINDI_WEBHOOK_SECRET',
    'CORS_ORIGIN',
  ] as const;

  private static readonly strengthKeys = ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

  static validateStrength(get: (key: string) => string | undefined): void {
    for (const key of RequiredSecrets.strengthKeys) {
      SecretStrength.assertStrong(key, get(key) ?? '');
    }
  }
}
