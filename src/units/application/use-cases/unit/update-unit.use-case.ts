import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { IGeocodingService } from '../../../domain/interfaces/geocoding.service.interface.js';
import type {
  IUnitRepository,
  UpdateUnitData,
} from '../../../domain/interfaces/unit.repository.interface.js';
import { UpdateUnitDto } from '../../../dto/unit/update-unit.dto.js';
import { UnitAddressComposer } from './unit-address.composer.js';

@Injectable()
export class UpdateUnitUseCase {
  private readonly logger = new Logger(UpdateUnitUseCase.name);

  constructor(
    @Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository,
    @Inject(DiTokens.geocodingService) private geocodingService: IGeocodingService,
  ) {}

  async updateUnitById(id: number, dto: UpdateUnitDto): Promise<Unit> {
    const existing = await this.unitRepository.findUnitById(id);

    if (!existing) {
      throw new NotFoundException('Unit not found');
    }

    if (dto.name && dto.name !== existing.name) {
      const nameConflict = await this.unitRepository.findUnitByName(dto.name);

      if (nameConflict) {
        throw new ConflictException('Unit name already in use');
      }
    }

    const merged = {
      street: dto.street ?? existing.street ?? undefined,
      number: dto.number ?? existing.number ?? undefined,
      neighborhood: dto.neighborhood ?? existing.neighborhood ?? undefined,
      city: dto.city ?? existing.city ?? undefined,
      state: dto.state ?? existing.state ?? undefined,
      cep: dto.cep ?? existing.cep ?? undefined,
    };

    const data: UpdateUnitData = {
      name: dto.name,
      serviceRadiusKm: dto.serviceRadiusKm,
      street: merged.street ?? null,
      number: merged.number ?? null,
      neighborhood: merged.neighborhood ?? null,
      city: merged.city ?? null,
      state: merged.state ?? null,
      cep: merged.cep ?? null,
      address: UnitAddressComposer.compose(merged),
    };

    if (dto.cep) {
      const { latitude, longitude } = await this.resolveCoordinates(dto.cep);
      data.latitude = latitude;
      data.longitude = longitude;
    }

    return this.unitRepository.updateUnitById(id, data);
  }

  private async resolveCoordinates(
    cep: string,
  ): Promise<{ latitude: number | null; longitude: number | null }> {
    try {
      const geocoded = await this.geocodingService.geocodeByCep(cep);

      if (geocoded.coordinates) {
        return {
          latitude: geocoded.coordinates.latitude,
          longitude: geocoded.coordinates.longitude,
        };
      }
    } catch (error) {
      this.logger.warn(`Geocoding failed for CEP ${cep}: ${String(error)}`);
    }

    return { latitude: null, longitude: null };
  }
}
