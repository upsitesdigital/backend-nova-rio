import { Module } from '@nestjs/common';
import { CreateHolidayUseCase } from './application/use-cases/holiday/create-holiday.use-case.js';
import { DeleteHolidayUseCase } from './application/use-cases/holiday/delete-holiday.use-case.js';
import { GetHolidayUseCase } from './application/use-cases/holiday/get-holiday.use-case.js';
import { ListHolidaysUseCase } from './application/use-cases/holiday/list-holidays.use-case.js';
import { SyncHolidaysUseCase } from './application/use-cases/holiday/sync-holidays.use-case.js';
import { UpdateHolidayUseCase } from './application/use-cases/holiday/update-holiday.use-case.js';
import { BRASIL_API_HOLIDAYS_SERVICE } from './domain/interfaces/brasil-api-holidays.service.interface.js';
import { HOLIDAY_REPOSITORY } from './domain/interfaces/holiday.repository.interface.js';
import { PrismaHolidayRepository } from './infrastructure/repositories/prisma-holiday.repository.js';
import { BrasilApiHolidaysService } from './infrastructure/services/brasil-api-holidays.service.js';
import { HolidaysSyncCron } from './infrastructure/services/holidays-sync.cron.js';
import { HolidaysController } from './holidays.controller.js';

@Module({
  controllers: [HolidaysController],
  providers: [
    { provide: HOLIDAY_REPOSITORY, useClass: PrismaHolidayRepository },
    { provide: BRASIL_API_HOLIDAYS_SERVICE, useClass: BrasilApiHolidaysService },
    SyncHolidaysUseCase,
    ListHolidaysUseCase,
    CreateHolidayUseCase,
    GetHolidayUseCase,
    UpdateHolidayUseCase,
    DeleteHolidayUseCase,
    HolidaysSyncCron,
  ],
  exports: [HOLIDAY_REPOSITORY],
})
export class HolidaysModule {}
