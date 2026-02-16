import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ServicesController } from './services.controller.js';
import { CreateServiceUseCase } from './application/use-cases/service/create-service.use-case.js';
import { ListServicesUseCase } from './application/use-cases/service/list-services.use-case.js';
import { GetServiceUseCase } from './application/use-cases/service/get-service.use-case.js';
import { UpdateServiceUseCase } from './application/use-cases/service/update-service.use-case.js';
import { DeleteServiceUseCase } from './application/use-cases/service/delete-service.use-case.js';

describe('ServicesController', () => {
  let controller: ServicesController;
  let createServiceUseCase: { createService: Mock };
  let listServicesUseCase: { listActiveServices: Mock };
  let getServiceUseCase: { getServiceById: Mock };
  let updateServiceUseCase: { updateServiceById: Mock };
  let deleteServiceUseCase: { deactivateServiceById: Mock };

  beforeEach(async () => {
    createServiceUseCase = { createService: vi.fn() };
    listServicesUseCase = { listActiveServices: vi.fn() };
    getServiceUseCase = { getServiceById: vi.fn() };
    updateServiceUseCase = { updateServiceById: vi.fn() };
    deleteServiceUseCase = { deactivateServiceById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        { provide: CreateServiceUseCase, useValue: createServiceUseCase },
        { provide: ListServicesUseCase, useValue: listServicesUseCase },
        { provide: GetServiceUseCase, useValue: getServiceUseCase },
        { provide: UpdateServiceUseCase, useValue: updateServiceUseCase },
        { provide: DeleteServiceUseCase, useValue: deleteServiceUseCase },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createService should call createServiceUseCase', async () => {
    const dto = { name: 'Faxina Regular', basePrice: 150 };
    await controller.createService(dto);
    expect(createServiceUseCase.createService).toHaveBeenCalledWith(dto);
  });

  it('listServices should call listServicesUseCase', async () => {
    await controller.listServices();
    expect(listServicesUseCase.listActiveServices).toHaveBeenCalled();
  });

  it('getServiceById should call getServiceUseCase', async () => {
    await controller.getServiceById(1);
    expect(getServiceUseCase.getServiceById).toHaveBeenCalledWith(1);
  });

  it('updateService should call updateServiceUseCase', async () => {
    const dto = { name: 'Faxina Premium' };
    await controller.updateService(1, dto);
    expect(updateServiceUseCase.updateServiceById).toHaveBeenCalledWith(1, dto);
  });

  it('deactivateService should call deleteServiceUseCase', async () => {
    await controller.deactivateService(1);
    expect(deleteServiceUseCase.deactivateServiceById).toHaveBeenCalledWith(1);
  });
});
