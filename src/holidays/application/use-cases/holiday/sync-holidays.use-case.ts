import { Inject, Injectable } from '@nestjs/common';
import {
  PONTOS_FACULTATIVOS,
  RIO_DE_JANEIRO_HOLIDAYS,
} from '../../../domain/constants/rio-holidays.constant.js';
import {
  BRASIL_API_HOLIDAYS_SERVICE,
  type IBrasilApiHolidaysService,
} from '../../../domain/interfaces/brasil-api-holidays.service.interface.js';
import {
  HOLIDAY_REPOSITORY,
  type CreateHolidayData,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';
import type { SyncHolidaysDto } from '../../../dto/holiday/sync-holidays.dto.js';

@Injectable()
export class SyncHolidaysUseCase {
  constructor(
    @Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository,
    @Inject(BRASIL_API_HOLIDAYS_SERVICE) private brasilApiService: IBrasilApiHolidaysService,
  ) {}

  async syncHolidaysByYear(dto: SyncHolidaysDto) {
    const nationalHolidays = await this.brasilApiService.fetchHolidaysByYear(dto.year);

    const carnavalEntry = nationalHolidays.find((h) => h.name.toLowerCase().includes('carnaval'));

    const allHolidays: CreateHolidayData[] = [
      ...nationalHolidays.map((h) => ({
        date: new Date(h.date),
        name: h.name,
        type: 'national',
        isBlocked: true,
      })),
      ...RIO_DE_JANEIRO_HOLIDAYS.map((h) => ({
        date: new Date(dto.year, h.month - 1, h.day),
        name: h.name,
        type: h.type,
        isBlocked: true,
      })),
      ...PONTOS_FACULTATIVOS.map((h) => ({
        date: new Date(dto.year, h.month - 1, h.day),
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

    return { synced: allHolidays.length, holidays: allHolidays };
  }
}
