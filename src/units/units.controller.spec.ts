import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UnitsController } from './units.controller.js';
import { CreateUnitUseCase } from './application/use-cases/unit/create-unit.use-case.js';
import { ListUnitsUseCase } from './application/use-cases/unit/list-units.use-case.js';
import { GetUnitUseCase } from './application/use-cases/unit/get-unit.use-case.js';
import { UpdateUnitUseCase } from './application/use-cases/unit/update-unit.use-case.js';
import { DeleteUnitUseCase } from './application/use-cases/unit/delete-unit.use-case.js';
import { ValidateServiceCoverageUseCase } from './application/use-cases/unit/validate-service-coverage.use-case.js';

describe('UnitsController', () => {
  let controller: UnitsController;
  let createUnitUseCase: { createUnit: Mock };
  let listUnitsUseCase: { listUnits: Mock };
  let getUnitUseCase: { getUnitById: Mock };
  let updateUnitUseCase: { updateUnitById: Mock };
  let deleteUnitUseCase: { deleteUnitById: Mock };
  let validateServiceCoverageUseCase: { validateCoverageByCep: Mock };

  beforeEach(async () => {
    createUnitUseCase = { createUnit: vi.fn() };
    listUnitsUseCase = { listUnits: vi.fn() };
    getUnitUseCase = { getUnitById: vi.fn() };
    updateUnitUseCase = { updateUnitById: vi.fn() };
    deleteUnitUseCase = { deleteUnitById: vi.fn() };
    validateServiceCoverageUseCase = { validateCoverageByCep: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        { provide: CreateUnitUseCase, useValue: createUnitUseCase },
        { provide: ListUnitsUseCase, useValue: listUnitsUseCase },
        { provide: GetUnitUseCase, useValue: getUnitUseCase },
        { provide: UpdateUnitUseCase, useValue: updateUnitUseCase },
        { provide: DeleteUnitUseCase, useValue: deleteUnitUseCase },
        { provide: ValidateServiceCoverageUseCase, useValue: validateServiceCoverageUseCase },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createUnit should call createUnitUseCase', async () => {
    const dto = { name: 'Unidade Centro' };
    await controller.createUnit(dto);
    expect(createUnitUseCase.createUnit).toHaveBeenCalledWith(dto);
  });

  it('listUnits should call listUnitsUseCase with query', async () => {
    const query = { page: 1, limit: 20 };
    await controller.listUnits(query);
    expect(listUnitsUseCase.listUnits).toHaveBeenCalledWith(query);
  });

  it('getUnitById should call getUnitUseCase', async () => {
    await controller.getUnitById(1);
    expect(getUnitUseCase.getUnitById).toHaveBeenCalledWith(1);
  });

  it('updateUnitById should call updateUnitUseCase', async () => {
    const dto = { name: 'Unidade Norte' };
    await controller.updateUnitById(1, dto);
    expect(updateUnitUseCase.updateUnitById).toHaveBeenCalledWith(1, dto);
  });

  it('deleteUnitById should call deleteUnitUseCase', async () => {
    await controller.deleteUnitById(1);
    expect(deleteUnitUseCase.deleteUnitById).toHaveBeenCalledWith(1);
  });

  it('validateServiceCoverage should call validateServiceCoverageUseCase', async () => {
    const query = { cep: '20040-020' };
    await controller.validateServiceCoverage(query);
    expect(validateServiceCoverageUseCase.validateCoverageByCep).toHaveBeenCalledWith('20040-020');
  });
});
