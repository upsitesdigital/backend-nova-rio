export class SecretStrength {
  private static readonly minLength = 32;
  private static readonly weakPlaceholders = [
    'jwt-secret',
    'jwt-refresh-secret',
    'changeme',
    'secret',
  ];

  static assertStrong(name: string, value: string): void {
    if (value.length < SecretStrength.minLength) {
      throw new Error(
        `Weak secret: ${name} must be at least ${SecretStrength.minLength} characters long`,
      );
    }
    if (SecretStrength.weakPlaceholders.includes(value)) {
      throw new Error(`Weak secret: ${name} uses a known insecure placeholder value`);
    }
  }
}
