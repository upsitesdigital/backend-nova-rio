import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaReportRepository } from './prisma-report.repository.js';

describe('PrismaReportRepository', () => {
  let repository: PrismaReportRepository;
  let prisma: {
    payment: { aggregate: Mock; findMany: Mock };
    client: { count: Mock; groupBy: Mock };
    unit: { findMany: Mock };
    appointment: { groupBy: Mock };
    service: { findMany: Mock };
    $queryRaw: Mock;
  };

  beforeEach(async () => {
    prisma = {
      payment: { aggregate: vi.fn(), findMany: vi.fn() },
      client: { count: vi.fn(), groupBy: vi.fn() },
      unit: { findMany: vi.fn() },
      appointment: { groupBy: vi.fn() },
      service: { findMany: vi.fn() },
      $queryRaw: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaReportRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaReportRepository>(PrismaReportRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getSalesSummary', () => {
    it('should return revenue summary', async () => {
      prisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
        _count: 10,
        _avg: { amount: 500 },
      });

      const result = await repository.getSalesSummary({});

      expect(result).toEqual({
        totalRevenue: 5000,
        totalPayments: 10,
        averageTicket: 500,
      });
      expect(prisma.payment.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'APPROVED' } }),
      );
    });

    it('should apply date and unit filters', async () => {
      prisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
        _avg: { amount: null },
      });

      const dateFrom = new Date('2026-01-01');
      const dateTo = new Date('2026-12-31');

      await repository.getSalesSummary({ dateFrom, dateTo, unitId: 1 });

      expect(prisma.payment.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paidAt: { gte: dateFrom, lte: dateTo },
            appointment: { unitId: 1 },
          }) as Record<string, unknown>,
        }),
      );
    });
  });

  describe('getActiveClients', () => {
    it('should return total active clients and per-unit breakdown', async () => {
      prisma.client.count.mockResolvedValue(25);
      prisma.client.groupBy.mockResolvedValue([{ unitId: 1, _count: 15 }]);
      prisma.unit.findMany.mockResolvedValue([{ id: 1, name: 'Unit A' }]);

      const result = await repository.getActiveClients({});

      expect(result.totalActive).toBe(25);
      expect(result.byUnit).toEqual([{ unitId: 1, unitName: 'Unit A', count: 15 }]);
    });

    it('should filter by unitId', async () => {
      prisma.client.count.mockResolvedValue(10);
      prisma.client.groupBy.mockResolvedValue([]);

      await repository.getActiveClients({ unitId: 2 });

      expect(prisma.client.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE', unitId: 2 },
      });
    });
  });

  describe('getHoursByService', () => {
    it('should return hours grouped by service', async () => {
      prisma.appointment.groupBy.mockResolvedValue([{ serviceId: 1, _sum: { duration: 240 } }]);
      prisma.service.findMany.mockResolvedValue([{ id: 1, name: 'Faxina Regular' }]);

      const result = await repository.getHoursByService({});

      expect(result).toEqual([{ serviceId: 1, serviceName: 'Faxina Regular', totalMinutes: 240 }]);
    });
  });

  describe('getTransactions', () => {
    const queryText = (call: unknown[]): string => (call[0] as string[]).join('');

    it('should group payments by month using SQL', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { period: '2026-01-01', total: 300, count: 2n },
        { period: '2026-02-01', total: 300, count: 1n },
      ]);

      const result = await repository.getTransactions({ groupBy: 'month' });

      expect(queryText(prisma.$queryRaw.mock.calls[0])).toContain("DATE_TRUNC('month'");
      expect(result).toEqual([
        { period: '2026-01-01', total: 300, count: 2 },
        { period: '2026-02-01', total: 300, count: 1 },
      ]);
    });

    it('should group payments by day using SQL', async () => {
      prisma.$queryRaw.mockResolvedValue([{ period: '2026-01-15', total: 100, count: 1n }]);

      const result = await repository.getTransactions({ groupBy: 'day' });

      expect(queryText(prisma.$queryRaw.mock.calls[0])).toContain("DATE_TRUNC('day'");
      expect(result).toEqual([{ period: '2026-01-15', total: 100, count: 1 }]);
    });

    it('should pass date filters as parameterized fragments', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      const dateFrom = new Date('2026-01-01');
      const dateTo = new Date('2026-12-31');

      await repository.getTransactions({ groupBy: 'week', dateFrom, dateTo });

      const call = prisma.$queryRaw.mock.calls[0];
      expect(queryText(call)).toContain("DATE_TRUNC('week'");
      const fragmentValues = call
        .slice(1)
        .flatMap((fragment) => (fragment as { values: unknown[] }).values);
      expect(fragmentValues).toContain(dateFrom);
      expect(fragmentValues).toContain(dateTo);
    });
  });

  describe('getExportRows', () => {
    it('should return flat export rows', async () => {
      prisma.payment.findMany.mockResolvedValue([
        {
          id: 1,
          paidAt: new Date('2026-01-15'),
          amount: 150,
          method: 'PIX',
          status: 'APPROVED',
          client: { name: 'John' },
          appointment: { date: new Date('2026-01-15'), service: { name: 'Faxina' } },
        },
      ]);

      const result = await repository.getExportRows({});

      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe('John');
      expect(result[0].serviceName).toBe('Faxina');
    });
  });
});
