import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import cardValidator from 'card-validator';

export function IsValidExpiry(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidExpiry',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: number, args: ValidationArguments) {
          const obj = args.object as { expiryMonth: number; expiryYear: number };
          const month = String(obj.expiryMonth).padStart(2, '0');
          const year = String(obj.expiryYear);
          return cardValidator.expirationDate({ month, year }).isValid;
        },
        defaultMessage() {
          return 'Card expiry date is invalid or already expired';
        },
      },
    });
  };
}
