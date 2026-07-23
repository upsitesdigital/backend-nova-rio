import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaDashboardRepository } from './prisma-dashboard.repository.js';

describe('PrismaDashboardRepository', () => {
  let repository: PrismaDashboardRepository;
  let prisma: {
    appointment: { count: Mock; findMany: Mock };
    client: { count: Mock };
  };

  beforeEach(async () => {
    prisma = {
      appointment: { count: vi.fn(), findMany: vi.fn() },
      client: { count: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaDashboardRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaDashboardRepository>(PrismaDashboardRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getTodayAppointmentsCount', () => {
    it('should count today scheduled appointments', async () => {
      prisma.appointment.count.mockResolvedValue(3);

      const result = await repository.getTodayAppointmentsCount({});

      expect(result).toBe(3);
      expect(prisma.appointment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCHEDULED',
          }) as Record<string, unknown>,
        }),
      );
    });

    it('should filter by unitId', async () => {
      prisma.appointment.count.mockResolvedValue(1);

      await repository.getTodayAppointmentsCount({ unitId: 2 });

      expect(prisma.appointment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ unitId: 2 }) as Record<string, unknown>,
        }),
      );
    });
  });

  describe('getActiveClientsCount', () => {
    it('should count active clients', async () => {
      prisma.client.count.mockResolvedValue(25);

      const result = await repository.getActiveClientsCount({});

      expect(result).toBe(25);
      expect(prisma.client.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
      });
    });

    it('should filter by unitId', async () => {
      prisma.client.count.mockResolvedValue(10);

      await repository.getActiveClientsCount({ unitId: 1 });

      expect(prisma.client.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE', unitId: 1 },
      });
    });
  });

  describe('getPendingAppointmentsCount', () => {
    it('should count scheduled appointments', async () => {
      prisma.appointment.count.mockResolvedValue(8);

      const result = await repository.getPendingAppointmentsCount({});

      expect(result).toBe(8);
      expect(prisma.appointment.count).toHaveBeenCalledWith({
        where: { status: 'SCHEDULED', payment: { status: 'APPROVED' } },
      });
    });
  });

  describe('getTodayAgenda', () => {
    it('should return mapped agenda items', async () => {
      const appointments = [
        {
          id: 1,
          startTime: '09:00',
          duration: 120,
          status: 'SCHEDULED',
          date: new Date(),
          client: { name: 'Maria' },
          service: { name: 'Limpeza' },
        },
      ];
      prisma.appointment.findMany.mockResolvedValue(appointments);

      const result = await repository.getTodayAgenda({ page: 1, limit: 10 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          appointmentId: 1,
          clientName: 'Maria',
          serviceName: 'Limpeza',
          startTime: '09:00',
        }) as Record<string, unknown>,
      );
    });

    it('should apply pagination', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.getTodayAgenda({ page: 2, limit: 5 });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }) as Record<string, unknown>,
      );
    });

    it('should filter by serviceId', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.getTodayAgenda({ serviceId: 3 });

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ serviceId: 3 }) as Record<string, unknown>,
        }),
      );
    });
  });

  describe('getTodayAgendaTotal', () => {
    it('should return total count for today', async () => {
      prisma.appointment.count.mockResolvedValue(15);

      const result = await repository.getTodayAgendaTotal({});

      expect(result).toBe(15);
    });
  });
});
