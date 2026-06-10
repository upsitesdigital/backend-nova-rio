import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { CreateServiceUseCase } from './application/use-cases/service/create-service.use-case.js';
import { DeleteServiceUseCase } from './application/use-cases/service/delete-service.use-case.js';
import { GetServiceUseCase } from './application/use-cases/service/get-service.use-case.js';
import { ListServicesUseCase } from './application/use-cases/service/list-services.use-case.js';
import { UpdateServiceUseCase } from './application/use-cases/service/update-service.use-case.js';
import { PrismaServiceRepository } from './infrastructure/repositories/prisma-service.repository.js';
import { ServicesController } from './services.controller.js';

@Module({
  controllers: [ServicesController],
  providers: [
    { provide: DiTokens.serviceRepository, useClass: PrismaServiceRepository },
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
  exports: [DiTokens.serviceRepository],
})
export class ServicesModule {}
