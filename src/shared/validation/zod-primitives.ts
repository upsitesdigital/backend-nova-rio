import { z } from 'zod';
import { cpf } from 'cpf-cnpj-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Reusable Zod validation primitives shared across DTO schemas.
 * Replaces the previous class-validator decorators (IsCPF, IsPhoneNumber,
 * IsStrongPassword, time/HH:mm matchers and query-param coercions).
 */
export class ZodPrimitives {
  static cpf = z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => cpf.isValid(value), { message: 'CPF is invalid' });

  static brPhone = z.string().refine((value) => isValidPhoneNumber(value, 'BR'), {
    message: 'phone must be a valid Brazilian phone number',
  });

  static strongPassword = z
    .string()
    .max(128)
    .refine(
      (value) =>
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value),
      {
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number and symbol',
      },
    );

  static time = z.string().regex(/^\d{2}:\d{2}$/, { message: 'must be in HH:mm format' });

  /** 6-digit numeric verification code. */
  static verificationCode = z
    .string()
    .regex(/^\d{6}$/, { message: 'Code must be exactly 6 digits' });

  /** Loose international phone format (looser than `brPhone`, allows separators). */
  static loosePhone = z
    .string()
    .max(20)
    .regex(/^\+?\d[\d\s()-]{7,19}$/, { message: 'Invalid phone number format' });

  /** Bare CPF (11) or CNPJ (14) digit string. */
  static cpfCnpjDigits = z
    .string()
    .max(20)
    .regex(/^\d{11}$|^\d{14}$/, {
      message: 'CPF must be 11 digits or CNPJ must be 14 digits',
    });

  /** Brazilian postal code (CEP) in XXXXX-XXX or XXXXXXXX format. */
  static cep = z
    .string()
    .min(1)
    .regex(/^\d{5}-?\d{3}$/, {
      message: 'CEP must be in XXXXX-XXX or XXXXXXXX format',
    });

  /** Last four digits of a card. */
  static cardLastFour = z
    .string()
    .min(1)
    .regex(/^\d{4}$/, { message: 'lastFourDigits must be exactly 4 digits' });

  /** Cardholder name (letters, spaces, hyphens, apostrophes, periods). */
  static cardHolderName = z
    .string()
    .min(1)
    .max(26)
    .regex(/^[A-Za-z\s\-'.]+$/, {
      message: 'holderName must contain only letters, spaces, hyphens, apostrophes, or periods',
    });

  static httpsUrl = z.url().refine((value) => value.startsWith('https://'), {
    message: 'must be a valid HTTPS URL',
  });

  /** Coerces an incoming query-string value to a positive integer. */
  static positiveIntQuery = z.coerce.number().int().positive();

  /** Coerces an incoming query-string value to a non-negative integer. */
  static intQuery = z.coerce.number().int();
}
