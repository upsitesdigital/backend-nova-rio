import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SyncHolidaysUseCase } from './sync-holidays.use-case.js';

describe('SyncHolidaysUseCase', () => {
  let useCase: SyncHolidaysUseCase;
  let holidayRepository: {
    bulkUpsertHolidays: Mock;
  };
  let brasilApiService: {
    fetchHolidaysByYear: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      bulkUpsertHolidays: vi.fn(),
    };
    brasilApiService = {
      fetchHolidaysByYear: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncHolidaysUseCase,
        { provide: DiTokens.holidayRepository, useValue: holidayRepository },
        { provide: DiTokens.brasilApiHolidaysService, useValue: brasilApiService },
      ],
    }).compile();

    useCase = module.get<SyncHolidaysUseCase>(SyncHolidaysUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should sync national, municipal, and facultativo holidays', async () => {
    const nationalHolidays = [
      { date: '2026-01-01', name: 'Confraternização mundial', type: 'national' },
      { date: '2026-04-21', name: 'Tiradentes', type: 'national' },
    ];
    brasilApiService.fetchHolidaysByYear.mockResolvedValue(nationalHolidays);
    holidayRepository.bulkUpsertHolidays.mockResolvedValue(undefined);

    const result = await useCase.syncHolidaysByYear({ year: 2026 });

    expect(brasilApiService.fetchHolidaysByYear).toHaveBeenCalledWith(2026);
    expect(holidayRepository.bulkUpsertHolidays).toHaveBeenCalledTimes(1);
    // 2 national + 2 municipal (São Sebastião, São Jorge) + 2 pontos facultativos (Professor, Servidor)
    expect(result.synced).toBe(6);
    expect(result.holidays).toHaveLength(6);
  });

  it('should add carnaval-derived holidays when carnaval is present', async () => {
    const nationalHolidays = [{ date: '2026-02-17', name: 'Carnaval', type: 'national' }];
    brasilApiService.fetchHolidaysByYear.mockResolvedValue(nationalHolidays);
    holidayRepository.bulkUpsertHolidays.mockResolvedValue(undefined);

    const result = await useCase.syncHolidaysByYear({ year: 2026 });

    const names = result.holidays.map((h: { name: string }) => h.name);
    expect(names).toContain('Segunda-feira de Carnaval');
    expect(names).toContain('Quarta-feira de Cinzas');

    // 1 national + 2 municipal + 2 pontos facultativos + 2 carnaval-derived
    expect(result.synced).toBe(7);
  });

  it('should not add carnaval-derived holidays when carnaval is absent', async () => {
    brasilApiService.fetchHolidaysByYear.mockResolvedValue([
      { date: '2026-01-01', name: 'Ano Novo', type: 'national' },
    ]);
    holidayRepository.bulkUpsertHolidays.mockResolvedValue(undefined);

    const result = await useCase.syncHolidaysByYear({ year: 2026 });

    const names = result.holidays.map((h: { name: string }) => h.name);
    expect(names).not.toContain('Segunda-feira de Carnaval');
    expect(names).not.toContain('Quarta-feira de Cinzas');
  });

  it('should set isBlocked true for national and municipal, false for facultativo', async () => {
    brasilApiService.fetchHolidaysByYear.mockResolvedValue([
      { date: '2026-01-01', name: 'Ano Novo', type: 'national' },
    ]);
    holidayRepository.bulkUpsertHolidays.mockResolvedValue(undefined);

    await useCase.syncHolidaysByYear({ year: 2026 });

    const holidays = holidayRepository.bulkUpsertHolidays.mock.calls[0][0] as Array<{
      name: string;
      isBlocked: boolean;
    }>;
    const nationalHoliday = holidays.find((h) => h.name === 'Ano Novo');
    const municipalHoliday = holidays.find((h) => h.name === 'Dia de São Sebastião');
    const facultativoHoliday = holidays.find((h) => h.name === 'Dia do Professor');

    expect(nationalHoliday!.isBlocked).toBe(true);
    expect(municipalHoliday!.isBlocked).toBe(true);
    expect(facultativoHoliday!.isBlocked).toBe(false);
  });
});
