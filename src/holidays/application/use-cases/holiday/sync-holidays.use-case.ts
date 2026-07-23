import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import { RioHolidays } from '../../../domain/constants/rio-holidays.constant.js';
import { type IBrasilApiHolidaysService } from '../../../domain/interfaces/brasil-api-holidays.service.interface.js';
import {
  type CreateHolidayData,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';
import type { SyncHolidaysDto } from '../../../dto/holiday/sync-holidays.dto.js';

@Injectable()
export class SyncHolidaysUseCase {
  constructor(
    @Inject(DiTokens.holidayRepository) private holidayRepository: IHolidayRepository,
    @Inject(DiTokens.brasilApiHolidaysService) private brasilApiService: IBrasilApiHolidaysService,
  ) {}

  async syncHolidaysByYear(dto: SyncHolidaysDto) {
    const nationalHolidays = await this.brasilApiService.fetchHolidaysByYear(dto.year);

    const carnavalEntry = nationalHolidays.find((h) => h.name.toLowerCase().includes('carnaval'));

    const allHolidays: CreateHolidayData[] = [
      ...nationalHolidays.map((h) => ({
        date: new Date(h.date),
        name: h.name,
        type: 'NATIONAL' as const,
        isBlocked: true,
      })),
      ...RioHolidays.stateMunicipal.map((h) => ({
        date: new Date(dto.year, h.month - 1, h.day),
        name: h.name,
        type: h.type,
        isBlocked: true,
      })),
      ...RioHolidays.pontosFacultativos.map((h) => ({
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
          type: 'FACULTATIVO' as const,
          isBlocked: false,
        },
        {
          date: quartaCinzas,
          name: 'Quarta-feira de Cinzas',
          type: 'FACULTATIVO' as const,
          isBlocked: false,
        },
      );
    }

    await this.holidayRepository.bulkUpsertHolidays(allHolidays);

    return { synced: allHolidays.length, holidays: allHolidays };
  }
}
