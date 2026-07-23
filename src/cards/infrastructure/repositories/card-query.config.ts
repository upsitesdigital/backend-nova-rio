export class CardQueryConfig {
  static readonly responseSelect = {
    id: true,
    lastFourDigits: true,
    brand: true,
    holderName: true,
    expiryMonth: true,
    expiryYear: true,
    isDefault: true,
  } as const;
}
