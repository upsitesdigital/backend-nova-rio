import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { IGeocodingService } from '../../../domain/interfaces/geocoding.service.interface.js';
import type {
  CreateUnitData,
  IUnitRepository,
} from '../../../domain/interfaces/unit.repository.interface.js';
import type { CreateUnitDto } from '../../../dto/unit/create-unit.dto.js';
import { UnitAddressComposer } from './unit-address.composer.js';

@Injectable()
export class CreateUnitUseCase {
  private readonly logger = new Logger(CreateUnitUseCase.name);

  constructor(
    @Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository,
    @Inject(DiTokens.geocodingService) private geocodingService: IGeocodingService,
  ) {}

  async createUnit(dto: CreateUnitDto): Promise<Unit> {
    const existing = await this.unitRepository.findUnitByName(dto.name);

    if (existing) {
      throw new ConflictException('Unit name already in use');
    }

    const address = UnitAddressComposer.compose(dto);
    const { latitude, longitude } = await this.resolveCoordinates(dto.cep);

    const data: CreateUnitData = {
      name: dto.name,
      street: dto.street ?? null,
      number: dto.number ?? null,
      neighborhood: dto.neighborhood ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      cep: dto.cep ?? null,
      address,
      latitude,
      longitude,
      serviceRadiusKm: dto.serviceRadiusKm,
    };

    return this.unitRepository.createUnit(data);
  }

  private async resolveCoordinates(
    cep?: string,
  ): Promise<{ latitude: number | null; longitude: number | null }> {
    if (!cep) {
      return { latitude: null, longitude: null };
    }

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
