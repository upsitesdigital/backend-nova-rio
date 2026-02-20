import { type Mock, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { ClientRegisterUseCase } from './client-register.use-case.js';

describe('ClientRegisterUseCase', () => {
  let useCase: ClientRegisterUseCase;
  let clientRepository: {
    findByEmail: Mock;
    create: Mock;
    updateRefreshToken: Mock;
  };
  let hashService: { hash: Mock };
  let tokenService: { generateTokens: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      updateRefreshToken: vi.fn(),
    };
    hashService = {
      hash: vi.fn(),
    };
    tokenService = {
      generateTokens: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRegisterUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: TOKEN_SERVICE, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get<ClientRegisterUseCase>(ClientRegisterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ConflictException if email is already registered', async () => {
    clientRepository.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

    await expect(
      useCase.execute({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        phone: '123456789',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create client, generate tokens and update refresh token on success', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      phone: '123456789',
    };
    const client = { id: 1, email: dto.email };
    const tokens = { accessToken: 'access', refreshToken: 'refresh' };

    clientRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockImplementation((val: string) => Promise.resolve(`hashed_${val}`));
    clientRepository.create.mockResolvedValue(client);
    tokenService.generateTokens.mockResolvedValue(tokens);

    const result = await useCase.execute(dto);

    expect(result).toEqual(tokens);
    expect(hashService.hash).toHaveBeenCalledWith(dto.password);
    expect(clientRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: 'hashed_password',
    });
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      sub: client.id,
      email: client.email,
      type: 'client',
    });
    expect(hashService.hash).toHaveBeenCalledWith(tokens.refreshToken);
    expect(clientRepository.updateRefreshToken).toHaveBeenCalledWith(client.id, 'hashed_refresh');
  });
});
