import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { BRASIL_API_HOLIDAYS_SERVICE } from '../../../domain/interfaces/brasil-api-holidays.service.interface.js';
import { HOLIDAY_REPOSITORY } from '../../../domain/interfaces/holiday.repository.interface.js';
import { SyncHolidaysUseCase } from './sync-holidays.use-case.js';

describe('SyncHolidaysUseCase', () => {
  let useCase: SyncHolidaysUseCase;
  let holidayRepository: {
    upsertHolidayByDate: Mock;
  };
  let brasilApiService: {
    fetchHolidaysByYear: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      upsertHolidayByDate: vi.fn(),
    };
    brasilApiService = {
      fetchHolidaysByYear: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncHolidaysUseCase,
        { provide: HOLIDAY_REPOSITORY, useValue: holidayRepository },
        { provide: BRASIL_API_HOLIDAYS_SERVICE, useValue: brasilApiService },
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
    holidayRepository.upsertHolidayByDate.mockImplementation((data) =>
      Promise.resolve({ id: 1, uuid: 'uuid', ...data }),
    );

    const result = await useCase.syncHolidaysByYear({ year: 2026 });

    expect(brasilApiService.fetchHolidaysByYear).toHaveBeenCalledWith(2026);
    // 2 national + 2 municipal (São Sebastião, São Jorge) + 2 pontos facultativos (Professor, Servidor)
    expect(result.synced).toBe(6);
    expect(result.holidays).toHaveLength(6);
  });

  it('should add carnaval-derived holidays when carnaval is present', async () => {
    const nationalHolidays = [{ date: '2026-02-17', name: 'Carnaval', type: 'national' }];
    brasilApiService.fetchHolidaysByYear.mockResolvedValue(nationalHolidays);
    holidayRepository.upsertHolidayByDate.mockImplementation((data) =>
      Promise.resolve({ id: 1, uuid: 'uuid', ...data }),
    );

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
    holidayRepository.upsertHolidayByDate.mockImplementation((data) =>
      Promise.resolve({ id: 1, uuid: 'uuid', ...data }),
    );

    const result = await useCase.syncHolidaysByYear({ year: 2026 });

    const names = result.holidays.map((h: { name: string }) => h.name);
    expect(names).not.toContain('Segunda-feira de Carnaval');
    expect(names).not.toContain('Quarta-feira de Cinzas');
  });

  it('should set isBlocked true for national and municipal, false for facultativo', async () => {
    brasilApiService.fetchHolidaysByYear.mockResolvedValue([
      { date: '2026-01-01', name: 'Ano Novo', type: 'national' },
    ]);
    holidayRepository.upsertHolidayByDate.mockImplementation((data) =>
      Promise.resolve({ id: 1, uuid: 'uuid', ...data }),
    );

    await useCase.syncHolidaysByYear({ year: 2026 });

    const calls = holidayRepository.upsertHolidayByDate.mock.calls as Array<
      [{ name: string; isBlocked: boolean }]
    >;
    const nationalCall = calls.find((c) => c[0].name === 'Ano Novo');
    const municipalCall = calls.find((c) => c[0].name === 'Dia de São Sebastião');
    const facultativoCall = calls.find((c) => c[0].name === 'Dia do Professor');

    expect(nationalCall![0].isBlocked).toBe(true);
    expect(municipalCall![0].isBlocked).toBe(true);
    expect(facultativoCall![0].isBlocked).toBe(false);
  });
});
