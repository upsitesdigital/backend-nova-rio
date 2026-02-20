import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CreateHolidayUseCase } from './application/use-cases/holiday/create-holiday.use-case.js';
import { DeleteHolidayUseCase } from './application/use-cases/holiday/delete-holiday.use-case.js';
import { GetHolidayUseCase } from './application/use-cases/holiday/get-holiday.use-case.js';
import { ListHolidaysUseCase } from './application/use-cases/holiday/list-holidays.use-case.js';
import { SyncHolidaysUseCase } from './application/use-cases/holiday/sync-holidays.use-case.js';
import { UpdateHolidayUseCase } from './application/use-cases/holiday/update-holiday.use-case.js';
import { HolidaysController } from './holidays.controller.js';

describe('HolidaysController', () => {
  let controller: HolidaysController;
  let syncHolidaysUseCase: { syncHolidaysByYear: Mock };
  let listHolidaysUseCase: { listHolidays: Mock };
  let createHolidayUseCase: { createHoliday: Mock };
  let getHolidayUseCase: { getHolidayById: Mock };
  let updateHolidayUseCase: { updateHolidayById: Mock };
  let deleteHolidayUseCase: { deleteHolidayById: Mock };

  beforeEach(async () => {
    syncHolidaysUseCase = { syncHolidaysByYear: vi.fn() };
    listHolidaysUseCase = { listHolidays: vi.fn() };
    createHolidayUseCase = { createHoliday: vi.fn() };
    getHolidayUseCase = { getHolidayById: vi.fn() };
    updateHolidayUseCase = { updateHolidayById: vi.fn() };
    deleteHolidayUseCase = { deleteHolidayById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidaysController],
      providers: [
        { provide: SyncHolidaysUseCase, useValue: syncHolidaysUseCase },
        { provide: ListHolidaysUseCase, useValue: listHolidaysUseCase },
        { provide: CreateHolidayUseCase, useValue: createHolidayUseCase },
        { provide: GetHolidayUseCase, useValue: getHolidayUseCase },
        { provide: UpdateHolidayUseCase, useValue: updateHolidayUseCase },
        { provide: DeleteHolidayUseCase, useValue: deleteHolidayUseCase },
      ],
    }).compile();

    controller = module.get<HolidaysController>(HolidaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('syncHolidays should call syncHolidaysUseCase', async () => {
    const dto = { year: 2026 };
    await controller.syncHolidays(dto);
    expect(syncHolidaysUseCase.syncHolidaysByYear).toHaveBeenCalledWith(dto);
  });

  it('listHolidays should call listHolidaysUseCase with undefined year if not provided', async () => {
    await controller.listHolidays();
    expect(listHolidaysUseCase.listHolidays).toHaveBeenCalledWith(undefined);
  });

  it('listHolidays should call listHolidaysUseCase with parsed year', async () => {
    await controller.listHolidays('2026');
    expect(listHolidaysUseCase.listHolidays).toHaveBeenCalledWith(2026);
  });

  it('getHolidayById should call getHolidayUseCase with id', async () => {
    await controller.getHolidayById(1);
    expect(getHolidayUseCase.getHolidayById).toHaveBeenCalledWith(1);
  });

  it('createHoliday should call createHolidayUseCase', async () => {
    const dto = {
      date: '2026-12-25',
      name: 'Natal',
      type: 'national',
      isBlocked: true,
    };
    await controller.createHoliday(dto);
    expect(createHolidayUseCase.createHoliday).toHaveBeenCalledWith(dto);
  });

  it('updateHoliday should call updateHolidayUseCase', async () => {
    const dto = { name: 'Natal Atualizado' };
    await controller.updateHoliday(1, dto);
    expect(updateHolidayUseCase.updateHolidayById).toHaveBeenCalledWith(1, dto);
  });

  it('deleteHoliday should call deleteHolidayUseCase', async () => {
    await controller.deleteHoliday(1);
    expect(deleteHolidayUseCase.deleteHolidayById).toHaveBeenCalledWith(1);
  });
});
