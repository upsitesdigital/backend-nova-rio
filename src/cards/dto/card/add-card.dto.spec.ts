import { AddCardDto } from './add-card.dto.js';

describe('AddCardDto expiry refinement', () => {
  const validData = {
    lastFourDigits: '1111',
    brand: 'VISA',
    holderName: 'Joao Silva',
    gatewayToken: 'tok_abc',
  };

  const hasExpiryError = (result: ReturnType<typeof AddCardDto.schema.safeParse>): boolean =>
    !result.success && result.error.issues.some((i) => i.path[0] === 'expiryYear');

  it('should pass for a future expiry date', () => {
    const result = AddCardDto.schema.safeParse({
      ...validData,
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 2,
    });

    expect(hasExpiryError(result)).toBe(false);
  });

  it('should fail for an expired date in the past', () => {
    const result = AddCardDto.schema.safeParse({
      ...validData,
      expiryMonth: 1,
      expiryYear: 2020,
    });

    expect(hasExpiryError(result)).toBe(true);
  });

  it('should pass for the current month and year', () => {
    const now = new Date();
    const result = AddCardDto.schema.safeParse({
      ...validData,
      expiryMonth: now.getMonth() + 1,
      expiryYear: now.getFullYear(),
    });

    expect(hasExpiryError(result)).toBe(false);
  });
});
