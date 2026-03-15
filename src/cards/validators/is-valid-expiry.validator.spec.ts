import { validate } from 'class-validator';
import { AddCardDto } from '../dto/card/add-card.dto.js';

describe('IsValidExpiry', () => {
  const buildDto = (month: number, year: number): AddCardDto => {
    const dto = new AddCardDto();
    dto.cardNumber = '4111111111111111';
    dto.holderName = 'João Silva';
    dto.expiryMonth = month;
    dto.expiryYear = year;
    dto.gatewayToken = 'tok_abc';
    return dto;
  };

  it('should pass for a future expiry date', async () => {
    const dto = buildDto(12, new Date().getFullYear() + 2);
    const errors = await validate(dto);
    const expiryError = errors.find((e) => e.property === 'expiryYear');
    expect(expiryError).toBeUndefined();
  });

  it('should fail for an expired date in the past', async () => {
    const dto = buildDto(1, 2020);
    const errors = await validate(dto);
    const expiryError = errors.find((e) => e.constraints?.isValidExpiry);
    expect(expiryError).toBeDefined();
  });

  it('should pass for the current month and year', async () => {
    const now = new Date();
    const dto = buildDto(now.getMonth() + 1, now.getFullYear());
    const errors = await validate(dto);
    const expiryError = errors.find((e) => e.constraints?.isValidExpiry);
    expect(expiryError).toBeUndefined();
  });
});
