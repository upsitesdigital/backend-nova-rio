import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
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

  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateEmployeeDto, validData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid CPF (random digits)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, cpf: '12345678900' });
    const errors = await validate(dto);

    const cpfError = errors.find((e) => e.property === 'cpf');
    expect(cpfError).toBeDefined();
  });

  it('should fail with invalid CPF (all same digits)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, cpf: '11111111111' });
    const errors = await validate(dto);

    const cpfError = errors.find((e) => e.property === 'cpf');
    expect(cpfError).toBeDefined();
  });

  it('should fail with invalid CPF (too short)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, cpf: '12345' });
    const errors = await validate(dto);

    const cpfError = errors.find((e) => e.property === 'cpf');
    expect(cpfError).toBeDefined();
  });

  it('should pass with valid CPF (unformatted)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, cpf: '98765432100' });
    const errors = await validate(dto);

    const cpfError = errors.find((e) => e.property === 'cpf');
    expect(cpfError).toBeUndefined();
  });

  it('should fail with invalid phone (too short)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, phone: '123' });
    const errors = await validate(dto);

    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeDefined();
  });

  it('should fail with invalid phone (US number)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, phone: '+12025551234' });
    const errors = await validate(dto);

    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeDefined();
  });

  it('should fail with invalid phone (random string)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, phone: 'not-a-phone' });
    const errors = await validate(dto);

    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeDefined();
  });

  it('should pass with valid BR phone (+55 format)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, phone: '+5511987654321' });
    const errors = await validate(dto);

    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeUndefined();
  });

  it('should pass with valid BR phone (without +55)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, phone: '11987654321' });
    const errors = await validate(dto);

    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeUndefined();
  });

  it('should pass without phone (optional)', async () => {
    const dataWithoutPhone = { name: validData.name, email: validData.email, cpf: validData.cpf };
    const dto = plainToInstance(CreateEmployeeDto, dataWithoutPhone);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid availabilityFrom format', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, availabilityFrom: '8am' });
    const errors = await validate(dto);

    const timeError = errors.find((e) => e.property === 'availabilityFrom');
    expect(timeError).toBeDefined();
  });

  it('should fail with invalid availabilityTo format', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, availabilityTo: '25:99' });
    const errors = await validate(dto);

    const timeError = errors.find((e) => e.property === 'availabilityTo');
    expect(timeError).toBeUndefined();
  });

  it('should fail with empty name', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, name: '' });
    const errors = await validate(dto);

    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should fail with empty email', async () => {
    const dto = plainToInstance(CreateEmployeeDto, { ...validData, email: '' });
    const errors = await validate(dto);

    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });
});
