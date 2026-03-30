import { Inject, Injectable } from '@nestjs/common';
import { isWithinRadius } from '../../../../shared/geo/geo.util.js';
import {
  GEOCODING_SERVICE,
  type GeocodedAddress,
  type IGeocodingService,
} from '../../../domain/interfaces/geocoding.service.interface.js';
import {
  UNIT_REPOSITORY,
  type IUnitRepository,
} from '../../../domain/interfaces/unit.repository.interface.js';

export interface CoverageResult {
  covered: boolean;
  address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  unitId: number | null;
  unitName: string | null;
}

@Injectable()
export class ValidateServiceCoverageUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private unitRepository: IUnitRepository,
    @Inject(GEOCODING_SERVICE) private geocodingService: IGeocodingService,
  ) {}

  async validateCoverageByCep(cep: string): Promise<CoverageResult> {
    const cleanCep = cep.replace(/\D/g, '');
    const geocoded = await this.geocodingService.geocodeByCep(cep);
    const addressPayload = this.buildAddress(geocoded);
    const { data: units } = await this.unitRepository.listUnits({ page: 1, limit: 100 });

    // Fallback: if a unit address explicitly contains this CEP, consider it covered.
    // This prevents false negatives when external geocoding providers omit coordinates.
    for (const unit of units) {
      const unitCep = this.extractCepFromText(unit.address ?? '');
      if (unitCep && unitCep === cleanCep) {
        return { covered: true, address: addressPayload, unitId: unit.id, unitName: unit.name };
      }
    }

    if (!geocoded.coordinates) {
      return { covered: false, address: addressPayload, unitId: null, unitName: null };
    }

    for (const unit of units) {
      if (unit.latitude === null || unit.longitude === null) {
        continue;
      }

      const unitCenter = { latitude: unit.latitude, longitude: unit.longitude };
      const covered = isWithinRadius(unitCenter, geocoded.coordinates, unit.serviceRadiusKm);

      if (covered) {
        return { covered: true, address: addressPayload, unitId: unit.id, unitName: unit.name };
      }
    }

    return { covered: false, address: addressPayload, unitId: null, unitName: null };
  }

  private buildAddress(geocoded: GeocodedAddress) {
    return {
      cep: geocoded.cep,
      street: geocoded.street,
      neighborhood: geocoded.neighborhood,
      city: geocoded.city,
      state: geocoded.state,
    };
  }

  private extractCepFromText(text: string): string | null {
    const match = text.match(/\b\d{5}-?\d{3}\b/);
    if (!match) return null;
    return match[0].replace(/\D/g, '');
  }
}
