import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaHolidayRepository } from './prisma-holiday.repository.js';

describe('PrismaHolidayRepository', () => {
  let repository: PrismaHolidayRepository;
  let prisma: {
    holiday: {
      create: Mock;
      findMany: Mock;
      findFirst: Mock;
      findUnique: Mock;
      update: Mock;
      delete: Mock;
      upsert: Mock;
      createMany: Mock;
    };
    $transaction: Mock;
  };

  beforeEach(async () => {
    prisma = {
      holiday: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        upsert: vi.fn(),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaHolidayRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaHolidayRepository>(PrismaHolidayRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createHoliday should call prisma.holiday.create', async () => {
    const data = { date: new Date('2026-01-01'), name: 'Ano Novo' };
    const created = { id: 1, uuid: 'uuid-1', ...data, type: 'NATIONAL' as const, isBlocked: true };

    prisma.holiday.create.mockResolvedValue(created);

    const result = await repository.createHoliday(data);

    expect(result).toEqual(created);
    expect(prisma.holiday.create).toHaveBeenCalledWith({ data });
  });

  it('findAllHolidays should return holidays ordered by date asc', async () => {
    const holidays = [{ id: 1 }, { id: 2 }];
    prisma.holiday.findMany.mockResolvedValue(holidays);

    const result = await repository.findAllHolidays();

    expect(result).toEqual(holidays);
    expect(prisma.holiday.findMany).toHaveBeenCalledWith({ orderBy: { date: 'asc' } });
  });

  it('findHolidaysByYear should filter by date range', async () => {
    const holidays = [{ id: 1 }];
    prisma.holiday.findMany.mockResolvedValue(holidays);

    const result = await repository.findHolidaysByYear(2026);

    expect(result).toEqual(holidays);
    expect(prisma.holiday.findMany).toHaveBeenCalledWith({
      where: {
        date: {
          gte: new Date('2026-01-01'),
          lt: new Date('2027-01-01'),
        },
      },
      orderBy: { date: 'asc' },
    });
  });

  it('findBlockedHolidayByDate should return blocked holiday for date', async () => {
    const holiday = { id: 1, date: new Date('2026-03-16'), name: 'Holiday', isBlocked: true };
    prisma.holiday.findFirst.mockResolvedValue(holiday);

    const result = await repository.findBlockedHolidayByDate(new Date('2026-03-16'));

    expect(result).toEqual(holiday);
    expect(prisma.holiday.findFirst).toHaveBeenCalledWith({
      where: { date: new Date('2026-03-16'), isBlocked: true },
    });
  });

  it('findBlockedHolidayByDate should return null when no blocked holiday', async () => {
    prisma.holiday.findFirst.mockResolvedValue(null);

    const result = await repository.findBlockedHolidayByDate(new Date('2026-03-16'));

    expect(result).toBeNull();
  });

  it('findHolidayById should call prisma.holiday.findUnique', async () => {
    const holiday = { id: 1, name: 'Ano Novo' };
    prisma.holiday.findUnique.mockResolvedValue(holiday);

    const result = await repository.findHolidayById(1);

    expect(result).toEqual(holiday);
    expect(prisma.holiday.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findHolidayById should return null when not found', async () => {
    prisma.holiday.findUnique.mockResolvedValue(null);

    const result = await repository.findHolidayById(999);

    expect(result).toBeNull();
  });

  it('updateHolidayById should call prisma.holiday.update', async () => {
    const data = { name: 'Updated Name' };
    const updated = { id: 1, name: 'Updated Name' };
    prisma.holiday.update.mockResolvedValue(updated);

    const result = await repository.updateHolidayById(1, data);

    expect(result).toEqual(updated);
    expect(prisma.holiday.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
  });

  it('deleteHolidayById should call prisma.holiday.delete', async () => {
    prisma.holiday.delete.mockResolvedValue({});

    await repository.deleteHolidayById(1);

    expect(prisma.holiday.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('upsertHolidayByDate should call prisma.holiday.upsert', async () => {
    const data = {
      date: new Date('2026-01-01'),
      name: 'Ano Novo',
      type: 'NATIONAL' as const,
      isBlocked: true,
    };
    const upserted = { id: 1, uuid: 'uuid-1', ...data };
    prisma.holiday.upsert.mockResolvedValue(upserted);

    const result = await repository.upsertHolidayByDate(data);

    expect(result).toEqual(upserted);
    expect(prisma.holiday.upsert).toHaveBeenCalledWith({
      where: { date: data.date },
      update: { name: data.name, type: data.type },
      create: data,
    });
  });

  it('bulkUpsertHolidays should create missing rows and update all rows', async () => {
    const holidays = [
      {
        date: new Date('2026-01-01'),
        name: 'Ano Novo',
        type: 'NATIONAL' as const,
        isBlocked: true,
      },
      {
        date: new Date('2026-04-21'),
        name: 'Tiradentes',
        type: 'NATIONAL' as const,
        isBlocked: true,
      },
    ];

    await repository.bulkUpsertHolidays(holidays);

    expect(prisma.holiday.createMany).toHaveBeenCalledWith({
      data: holidays,
      skipDuplicates: true,
    });
    expect(prisma.holiday.update).toHaveBeenCalledTimes(2);
  });

  it('bulkUpsertHolidays should handle empty array', async () => {
    await repository.bulkUpsertHolidays([]);

    expect(prisma.holiday.createMany).toHaveBeenCalledWith({ data: [], skipDuplicates: true });
    expect(prisma.holiday.update).not.toHaveBeenCalled();
  });
});
