import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test } from '@nestjs/testing';
import type { Unit } from '@prisma/client';
import { ValidateServiceCoverageUseCase } from './validate-service-coverage.use-case.js';

const mockUnit: Unit = {
  id: 1,
  uuid: 'test-uuid',
  name: 'Unidade Centro',
  address: 'Rua da Assembleia, Centro',
  latitude: -22.9068,
  longitude: -43.1729,
  serviceRadiusKm: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ValidateServiceCoverageUseCase', () => {
  let useCase: ValidateServiceCoverageUseCase;
  let unitRepository: Record<string, ReturnType<typeof vi.fn>>;
  let geocodingService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    unitRepository = {
      listUnits: vi.fn().mockResolvedValue({ data: [mockUnit], total: 1, page: 1, limit: 100 }),
      createUnit: vi.fn(),
      findUnitById: vi.fn(),
      findUnitByName: vi.fn(),
      updateUnitById: vi.fn(),
      deleteUnitById: vi.fn(),
    };

    geocodingService = {
      geocodeByCep: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ValidateServiceCoverageUseCase,
        { provide: DiTokens.unitRepository, useValue: unitRepository },
        { provide: DiTokens.geocodingService, useValue: geocodingService },
      ],
    }).compile();

    useCase = module.get(ValidateServiceCoverageUseCase);
  });

  it('should return covered=true when CEP is within unit radius', async () => {
    geocodingService.geocodeByCep.mockResolvedValue({
      cep: '20040-020',
      street: 'Rua da Assembleia',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      coordinates: { latitude: -22.908, longitude: -43.174 },
    });

    unitRepository.listUnits.mockResolvedValue({
      data: [mockUnit],
      total: 1,
      page: 1,
      limit: 100,
    });

    const result = await useCase.validateCoverageByCep('20040-020');

    expect(result.covered).toBe(true);
    expect(result.unitId).toBe(1);
    expect(result.unitName).toBe('Unidade Centro');
  });

  it('should return covered=false when CEP is outside all unit radii', async () => {
    geocodingService.geocodeByCep.mockResolvedValue({
      cep: '01001-000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      coordinates: { latitude: -23.5505, longitude: -46.6333 },
    });

    unitRepository.listUnits.mockResolvedValue({
      data: [mockUnit],
      total: 1,
      page: 1,
      limit: 100,
    });

    const result = await useCase.validateCoverageByCep('01001-000');

    expect(result.covered).toBe(false);
    expect(result.unitId).toBeNull();
  });

  it('should return covered=false with address when coordinates unavailable', async () => {
    geocodingService.geocodeByCep.mockResolvedValue({
      cep: '13604-186',
      street: 'Rua Exemplo',
      neighborhood: 'Centro',
      city: 'Araras',
      state: 'SP',
      coordinates: null,
    });

    const result = await useCase.validateCoverageByCep('13604-186');

    expect(result.covered).toBe(false);
    expect(result.address.city).toBe('Araras');
    expect(result.unitId).toBeNull();
  });

  it('should skip units without coordinates', async () => {
    geocodingService.geocodeByCep.mockResolvedValue({
      cep: '20040-020',
      street: 'Rua da Assembleia',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      coordinates: { latitude: -22.908, longitude: -43.174 },
    });

    const unitWithoutCoords = { ...mockUnit, latitude: null, longitude: null };
    unitRepository.listUnits.mockResolvedValue({
      data: [unitWithoutCoords],
      total: 1,
      page: 1,
      limit: 100,
    });

    const result = await useCase.validateCoverageByCep('20040-020');

    expect(result.covered).toBe(false);
  });
});
