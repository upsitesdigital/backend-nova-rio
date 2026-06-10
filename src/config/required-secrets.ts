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
}
