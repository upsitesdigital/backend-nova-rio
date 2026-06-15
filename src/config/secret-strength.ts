export class SecretStrength {
  private static readonly minLength = 32;
  private static readonly minDistinctChars = 10;
  private static readonly weakPlaceholders = [
    'jwt-secret',
    'jwt-refresh-secret',
    'changeme',
    'secret',
    'admin',
    'password',
    'dev-webhook-secret',
    'dev-webhook-pass',
  ];

  static assertStrong(name: string, value: string): void {
    if (value.length < SecretStrength.minLength) {
      throw new Error(
        `Weak secret: ${name} must be at least ${SecretStrength.minLength} characters long`,
      );
    }
    if (SecretStrength.weakPlaceholders.includes(value.toLowerCase())) {
      throw new Error(`Weak secret: ${name} uses a known insecure placeholder value`);
    }
    if (SecretStrength.distinctChars(value) < SecretStrength.minDistinctChars) {
      throw new Error(
        `Weak secret: ${name} has low entropy (needs at least ${SecretStrength.minDistinctChars} distinct characters)`,
      );
    }
  }

  private static distinctChars(value: string): number {
    return new Set(value).size;
  }
}
