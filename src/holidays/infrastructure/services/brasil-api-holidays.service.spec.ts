import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { BrasilApiHolidaysService } from './brasil-api-holidays.service.js';

describe('BrasilApiHolidaysService', () => {
  let service: BrasilApiHolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrasilApiHolidaysService],
    }).compile();

    service = module.get<BrasilApiHolidaysService>(BrasilApiHolidaysService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch holidays from BrasilAPI', async () => {
    const mockHolidays = [
      { date: '2026-01-01', name: 'Confraternização mundial', type: 'national' },
      { date: '2026-04-21', name: 'Tiradentes', type: 'national' },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHolidays),
    } as Response);

    const result = await service.fetchHolidaysByYear(2026);

    expect(result).toEqual(mockHolidays);
    expect(fetch).toHaveBeenCalledWith('https://brasilapi.com.br/api/feriados/v1/2026');
  });

  it('should throw error when BrasilAPI returns non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(service.fetchHolidaysByYear(2026)).rejects.toThrow(
      'Failed to fetch holidays from BrasilAPI: Internal Server Error',
    );
  });
});
