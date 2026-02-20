import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BcryptHashService } from './bcrypt-hash.service.js';

vi.mock('bcrypt');

describe('BcryptHashService', () => {
  let service: BcryptHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptHashService],
    }).compile();

    service = module.get<BcryptHashService>(BcryptHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('hash should call bcrypt.hash', async () => {
    (bcrypt.hash as Mock).mockResolvedValue('hashed');
    const result = await service.hash('value');
    expect(result).toBe('hashed');
    expect(bcrypt.hash).toHaveBeenCalledWith('value', 10);
  });

  it('compare should call bcrypt.compare', async () => {
    (bcrypt.compare as Mock).mockResolvedValue(true);
    const result = await service.compare('value', 'hashed');
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('value', 'hashed');
  });
});
