import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetActiveClientsUseCase } from './get-active-clients.use-case.js';

describe('GetActiveClientsUseCase', () => {
  let useCase: GetActiveClientsUseCase;
  let reportRepository: { getActiveClients: Mock };

  beforeEach(async () => {
    reportRepository = { getActiveClients: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveClientsUseCase,
        { provide: DiTokens.reportRepository, useValue: reportRepository },
      ],
    }).compile();

    useCase = module.get<GetActiveClientsUseCase>(GetActiveClientsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return active clients count', async () => {
    const response = { totalActive: 25, byUnit: [{ unitId: 1, unitName: 'A', count: 10 }] };
    reportRepository.getActiveClients.mockResolvedValue(response);

    const result = await useCase.getActiveClients({});

    expect(result).toEqual(response);
    expect(reportRepository.getActiveClients).toHaveBeenCalledWith({});
  });

  it('should pass unitId filter', async () => {
    reportRepository.getActiveClients.mockResolvedValue({ totalActive: 5, byUnit: [] });

    await useCase.getActiveClients({ unitId: 2 });

    expect(reportRepository.getActiveClients).toHaveBeenCalledWith({ unitId: 2 });
  });
});
