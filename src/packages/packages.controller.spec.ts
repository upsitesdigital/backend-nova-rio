import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PackagesController } from './packages.controller.js';
import { CreatePackageUseCase } from './application/use-cases/package/create-package.use-case.js';
import { ListPackagesUseCase } from './application/use-cases/package/list-packages.use-case.js';
import { GetPackageUseCase } from './application/use-cases/package/get-package.use-case.js';
import { UpdatePackageUseCase } from './application/use-cases/package/update-package.use-case.js';
import { ReactivatePackageUseCase } from './application/use-cases/package/reactivate-package.use-case.js';
import { DeletePackageUseCase } from './application/use-cases/package/delete-package.use-case.js';

describe('PackagesController', () => {
  let controller: PackagesController;
  let createPackageUseCase: { createPackage: Mock };
  let listPackagesUseCase: { listPackages: Mock };
  let getPackageUseCase: { getPackageById: Mock };
  let updatePackageUseCase: { updatePackageById: Mock };
  let reactivatePackageUseCase: { reactivatePackageById: Mock };
  let deletePackageUseCase: { deactivatePackageById: Mock };

  beforeEach(async () => {
    createPackageUseCase = { createPackage: vi.fn() };
    listPackagesUseCase = { listPackages: vi.fn() };
    getPackageUseCase = { getPackageById: vi.fn() };
    updatePackageUseCase = { updatePackageById: vi.fn() };
    reactivatePackageUseCase = { reactivatePackageById: vi.fn() };
    deletePackageUseCase = { deactivatePackageById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
      providers: [
        { provide: CreatePackageUseCase, useValue: createPackageUseCase },
        { provide: ListPackagesUseCase, useValue: listPackagesUseCase },
        { provide: GetPackageUseCase, useValue: getPackageUseCase },
        { provide: UpdatePackageUseCase, useValue: updatePackageUseCase },
        { provide: ReactivatePackageUseCase, useValue: reactivatePackageUseCase },
        { provide: DeletePackageUseCase, useValue: deletePackageUseCase },
      ],
    }).compile();

    controller = module.get<PackagesController>(PackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createPackage should call createPackageUseCase', async () => {
    const dto = { name: 'Pacote 10 horas', price: 1200, serviceId: 1 };
    await controller.createPackage(dto);
    expect(createPackageUseCase.createPackage).toHaveBeenCalledWith(dto);
  });

  it('listPackages should call listPackagesUseCase with query', async () => {
    const query = { page: 1, limit: 20 };
    await controller.listPackages(query);
    expect(listPackagesUseCase.listPackages).toHaveBeenCalledWith(query);
  });

  it('listPackages should pass active and serviceId filters', async () => {
    const query = { page: 1, limit: 20, active: true, serviceId: 1 };
    await controller.listPackages(query);
    expect(listPackagesUseCase.listPackages).toHaveBeenCalledWith(query);
  });

  it('getPackageById should call getPackageUseCase', async () => {
    await controller.getPackageById(1);
    expect(getPackageUseCase.getPackageById).toHaveBeenCalledWith(1);
  });

  it('updatePackage should call updatePackageUseCase', async () => {
    const dto = { name: 'Pacote 20 horas' };
    await controller.updatePackage(1, dto);
    expect(updatePackageUseCase.updatePackageById).toHaveBeenCalledWith(1, dto);
  });

  it('reactivatePackage should call reactivatePackageUseCase', async () => {
    await controller.reactivatePackage(1);
    expect(reactivatePackageUseCase.reactivatePackageById).toHaveBeenCalledWith(1);
  });

  it('deactivatePackage should call deletePackageUseCase', async () => {
    await controller.deactivatePackage(1);
    expect(deletePackageUseCase.deactivatePackageById).toHaveBeenCalledWith(1);
  });
});
