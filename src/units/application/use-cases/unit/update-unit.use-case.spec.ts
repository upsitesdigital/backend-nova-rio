import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UpdateUnitUseCase } from './update-unit.use-case.js';

describe('UpdateUnitUseCase', () => {
  let useCase: UpdateUnitUseCase;
  let unitRepository: { findUnitById: Mock; findUnitByName: Mock; updateUnitById: Mock };
  let geocodingService: { geocodeByCep: Mock };

  beforeEach(async () => {
    unitRepository = {
      findUnitById: vi.fn(),
      findUnitByName: vi.fn(),
      updateUnitById: vi.fn(),
    };

    geocodingService = {
      geocodeByCep: vi.fn().mockResolvedValue({ coordinates: null }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUnitUseCase,
        { provide: DiTokens.unitRepository, useValue: unitRepository },
        { provide: DiTokens.geocodingService, useValue: geocodingService },
      ],
    }).compile();

    useCase = module.get<UpdateUnitUseCase>(UpdateUnitUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a unit by id', async () => {
    const existing = { id: 1, name: 'Unidade Centro' };
    const updated = { ...existing, name: 'Unidade Norte' };
    const dto = { name: 'Unidade Norte' };

    unitRepository.findUnitById.mockResolvedValue(existing);
    unitRepository.findUnitByName.mockResolvedValue(null);
    unitRepository.updateUnitById.mockResolvedValue(updated);

    const result = await useCase.updateUnitById(1, dto);

    expect(result).toEqual(updated);
    expect(unitRepository.findUnitById).toHaveBeenCalledWith(1);
    expect(unitRepository.findUnitByName).toHaveBeenCalledWith('Unidade Norte');
    expect(unitRepository.updateUnitById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Unidade Norte' }),
    );
  });

  it('should throw NotFoundException if unit not found', async () => {
    unitRepository.findUnitById.mockResolvedValue(null);

    await expect(useCase.updateUnitById(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    expect(unitRepository.updateUnitById).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if new name already exists', async () => {
    const existing = { id: 1, name: 'Unidade Centro' };

    unitRepository.findUnitById.mockResolvedValue(existing);
    unitRepository.findUnitByName.mockResolvedValue({ id: 2, name: 'Unidade Norte' });

    await expect(useCase.updateUnitById(1, { name: 'Unidade Norte' })).rejects.toThrow(
      ConflictException,
    );
    expect(unitRepository.updateUnitById).not.toHaveBeenCalled();
  });

  it('should skip name uniqueness check when name is unchanged', async () => {
    const existing = { id: 1, name: 'Unidade Centro' };
    const updated = { ...existing, address: 'Rua Nova, 456' };
    const dto = { name: 'Unidade Centro', address: 'Rua Nova, 456' };

    unitRepository.findUnitById.mockResolvedValue(existing);
    unitRepository.updateUnitById.mockResolvedValue(updated);

    const result = await useCase.updateUnitById(1, dto);

    expect(result).toEqual(updated);
    expect(unitRepository.findUnitByName).not.toHaveBeenCalled();
  });
});
