import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { ClientLoginUseCase } from './client-login.use-case.js';

describe('ClientLoginUseCase', () => {
  let useCase: ClientLoginUseCase;
  let clientRepository: { findByEmail: jest.Mock; updateRefreshToken: jest.Mock };
  let hashService: { compare: jest.Mock; hash: jest.Mock };
  let tokenService: { generateTokens: jest.Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    hashService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
    tokenService = {
      generateTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientLoginUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: TOKEN_SERVICE, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get<ClientLoginUseCase>(ClientLoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw UnauthorizedException if client not found', async () => {
    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    clientRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
    });
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return tokens and update refresh token on success', async () => {
    const client = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
    };
    const tokens = {
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    clientRepository.findByEmail.mockResolvedValue(client);
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('hashedRefresh');

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual(tokens);
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      sub: client.id,
      email: client.email,
      type: 'client',
    });
    expect(hashService.hash).toHaveBeenCalledWith(tokens.refreshToken);
    expect(clientRepository.updateRefreshToken).toHaveBeenCalledWith(client.id, 'hashedRefresh');
  });
});
