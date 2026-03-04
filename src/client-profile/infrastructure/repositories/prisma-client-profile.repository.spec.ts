import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientProfileRepository } from './prisma-client-profile.repository.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

describe('PrismaClientProfileRepository', () => {
  let repository: PrismaClientProfileRepository;
  let prisma: { client: { update: ReturnType<typeof vi.fn> } };

  const mockProfile = {
    id: 1,
    name: 'João',
    email: 'joao@example.com',
    phone: '21999999999',
    avatarUrl: null,
    company: null,
    cpfCnpj: null,
    address: null,
    status: 'ACTIVE',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = { client: { update: vi.fn().mockResolvedValue(mockProfile) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaClientProfileRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaClientProfileRepository>(PrismaClientProfileRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should update profile with provided data', async () => {
    const data = { name: 'João Atualizado', phone: '21888888888' };

    const result = await repository.updateProfile(1, data);

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        company: true,
        cpfCnpj: true,
        address: true,
        status: true,
        createdAt: true,
      },
    });
    expect(result).toEqual(mockProfile);
  });

  it('should handle partial update', async () => {
    const data = { company: 'Nova Rio Corp' };

    await repository.updateProfile(2, data);

    expect(prisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 2 }, data }),
    );
  });
});
