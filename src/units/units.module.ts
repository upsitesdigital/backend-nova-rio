import { Module } from '@nestjs/common';
import { CreateUnitUseCase } from './application/use-cases/unit/create-unit.use-case.js';
import { DeleteUnitUseCase } from './application/use-cases/unit/delete-unit.use-case.js';
import { GetUnitUseCase } from './application/use-cases/unit/get-unit.use-case.js';
import { ListUnitsUseCase } from './application/use-cases/unit/list-units.use-case.js';
import { UpdateUnitUseCase } from './application/use-cases/unit/update-unit.use-case.js';
import { ValidateServiceCoverageUseCase } from './application/use-cases/unit/validate-service-coverage.use-case.js';
import { GEOCODING_SERVICE } from './domain/interfaces/geocoding.service.interface.js';
import { UNIT_REPOSITORY } from './domain/interfaces/unit.repository.interface.js';
import { PrismaUnitRepository } from './infrastructure/repositories/prisma-unit.repository.js';
import { BrasilApiGeocodingService } from './infrastructure/services/brasil-api-geocoding.service.js';
import { UnitsController } from './units.controller.js';

@Module({
  controllers: [UnitsController],
  providers: [
    { provide: UNIT_REPOSITORY, useClass: PrismaUnitRepository },
    { provide: GEOCODING_SERVICE, useClass: BrasilApiGeocodingService },
    CreateUnitUseCase,
    ListUnitsUseCase,
    GetUnitUseCase,
    UpdateUnitUseCase,
    DeleteUnitUseCase,
    ValidateServiceCoverageUseCase,
  ],
})
export class UnitsModule {}
