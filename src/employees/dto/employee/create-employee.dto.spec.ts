import { CreateEmployeeDto } from './create-employee.dto.js';

describe('CreateEmployeeDto', () => {
  const validData = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    cpf: '987.654.321-00',
    phone: '+5521999998888',
    availabilityFrom: '08:00',
    availabilityTo: '18:00',
  };

  const hasFieldError = (
    result: ReturnType<typeof CreateEmployeeDto.schema.safeParse>,
    field: string,
  ): boolean => !result.success && result.error.issues.some((i) => i.path[0] === field);

  it('should pass with valid data', () => {
    const result = CreateEmployeeDto.schema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should fail with invalid CPF (random digits)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, cpf: '12345678900' });

    expect(hasFieldError(result, 'cpf')).toBe(true);
  });

  it('should fail with invalid CPF (all same digits)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, cpf: '11111111111' });

    expect(hasFieldError(result, 'cpf')).toBe(true);
  });

  it('should fail with invalid CPF (too short)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, cpf: '12345' });

    expect(hasFieldError(result, 'cpf')).toBe(true);
  });

  it('should pass with valid CPF (unformatted)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, cpf: '98765432100' });

    expect(hasFieldError(result, 'cpf')).toBe(false);
  });

  it('should fail with invalid phone (too short)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, phone: '123' });

    expect(hasFieldError(result, 'phone')).toBe(true);
  });

  it('should fail with invalid phone (too few digits for BR)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, phone: '+5511' });

    expect(hasFieldError(result, 'phone')).toBe(true);
  });

  it('should fail with invalid phone (random string)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, phone: 'not-a-phone' });

    expect(hasFieldError(result, 'phone')).toBe(true);
  });

  it('should pass with valid BR phone (+55 format)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, phone: '+5511987654321' });

    expect(hasFieldError(result, 'phone')).toBe(false);
  });

  it('should pass with valid BR phone (without +55)', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, phone: '11987654321' });

    expect(hasFieldError(result, 'phone')).toBe(false);
  });

  it('should pass without phone (optional)', () => {
    const dataWithoutPhone = { name: validData.name, email: validData.email, cpf: validData.cpf };
    const result = CreateEmployeeDto.schema.safeParse(dataWithoutPhone);

    expect(result.success).toBe(true);
  });

  it('should fail with invalid availabilityFrom format', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, availabilityFrom: '8am' });

    expect(hasFieldError(result, 'availabilityFrom')).toBe(true);
  });

  it('should pass with availabilityTo that matches the HH:mm pattern', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, availabilityTo: '25:99' });

    expect(hasFieldError(result, 'availabilityTo')).toBe(false);
  });

  it('should fail with empty name', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, name: '' });

    expect(hasFieldError(result, 'name')).toBe(true);
  });

  it('should fail with empty email', () => {
    const result = CreateEmployeeDto.schema.safeParse({ ...validData, email: '' });

    expect(hasFieldError(result, 'email')).toBe(true);
  });
});
