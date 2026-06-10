import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PONTOS_FACULTATIVOS,
  RIO_DE_JANEIRO_HOLIDAYS,
} from '../../domain/constants/rio-holidays.constant.js';
import {
  BRASIL_API_HOLIDAYS_SERVICE,
  type IBrasilApiHolidaysService,
} from '../../domain/interfaces/brasil-api-holidays.service.interface.js';
import {
  HOLIDAY_REPOSITORY,
  type CreateHolidayData,
  type IHolidayRepository,
} from '../../domain/interfaces/holiday.repository.interface.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

@Injectable()
export class HolidaysSyncCron {
  private readonly logger = new Logger(HolidaysSyncCron.name);

  constructor(
    @Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository,
    @Inject(BRASIL_API_HOLIDAYS_SERVICE) private brasilApiService: IBrasilApiHolidaysService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async syncHolidaysMonthly() {
    const year = new Date().getFullYear();
    this.logger.log(`Starting monthly holidays sync for year ${year}`);

    try {
      const acquired = await this.prisma.$queryRaw<Array<{ name: string }>>`
        INSERT INTO job_locks ("name", "lockedUntil")
        VALUES ('holidays_sync', NOW() + INTERVAL '15 minutes')
        ON CONFLICT ("name") DO UPDATE
        SET "lockedUntil" = EXCLUDED."lockedUntil"
        WHERE job_locks."lockedUntil" <= NOW()
        RETURNING "name"
      `;

      if (acquired.length !== 1) {
        this.logger.log('Monthly holidays sync skipped because another instance is running');
        return;
      }

      const nationalHolidays = await this.brasilApiService.fetchHolidaysByYear(year);

      const carnavalEntry = nationalHolidays.find((h) => h.name.toLowerCase().includes('carnaval'));

      const allHolidays: CreateHolidayData[] = [
        ...nationalHolidays.map((h) => ({
          date: new Date(h.date),
          name: h.name,
          type: 'national',
          isBlocked: true,
        })),
        ...RIO_DE_JANEIRO_HOLIDAYS.map((h) => ({
          date: new Date(year, h.month - 1, h.day),
          name: h.name,
          type: h.type,
          isBlocked: true,
        })),
        ...PONTOS_FACULTATIVOS.map((h) => ({
          date: new Date(year, h.month - 1, h.day),
          name: h.name,
          type: h.type,
          isBlocked: false,
        })),
      ];

      if (carnavalEntry) {
        const carnavalDate = new Date(carnavalEntry.date);

        const segundaCarnaval = new Date(carnavalDate);
        segundaCarnaval.setDate(carnavalDate.getDate() - 1);

        const quartaCinzas = new Date(carnavalDate);
        quartaCinzas.setDate(carnavalDate.getDate() + 1);

        allHolidays.push(
          {
            date: segundaCarnaval,
            name: 'Segunda-feira de Carnaval',
            type: 'facultativo',
            isBlocked: false,
          },
          {
            date: quartaCinzas,
            name: 'Quarta-feira de Cinzas',
            type: 'facultativo',
            isBlocked: false,
          },
        );
      }

      await this.holidayRepository.bulkUpsertHolidays(allHolidays);

      this.logger.log(`Synced ${allHolidays.length} holidays for year ${year}`);
    } catch (error) {
      this.logger.error(
        `Failed to sync holidays: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await this.prisma.$executeRaw`
        UPDATE job_locks
        SET "lockedUntil" = NOW()
        WHERE "name" = 'holidays_sync'
      `;
    }
  }
}
