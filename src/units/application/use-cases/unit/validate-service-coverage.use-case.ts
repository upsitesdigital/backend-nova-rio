import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CepUtil } from '../../../../shared/cep/cep.util.js';
import { GeoUtil } from '../../../../shared/geo/geo.util.js';
import {
  type GeocodedAddress,
  type IGeocodingService,
} from '../../../domain/interfaces/geocoding.service.interface.js';
import { type IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';

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
  private readonly logger = new Logger(ValidateServiceCoverageUseCase.name);

  constructor(
    @Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository,
    @Inject(DiTokens.geocodingService) private geocodingService: IGeocodingService,
  ) {}

  async validateCoverageByCep(cep: string): Promise<CoverageResult> {
    const cleanCep = CepUtil.normalize(cep);
    const { data: units } = await this.unitRepository.listUnits({ page: 1, limit: 100 });

    // Geocoding relies on an external provider that may be unavailable. A transient failure
    // must not block coverage validation, so we keep going and fall back to a CEP match.
    let geocoded: GeocodedAddress | null = null;
    try {
      geocoded = await this.geocodingService.geocodeByCep(cep);
    } catch (error) {
      this.logger.warn(
        `Geocoding failed for CEP ${cleanCep}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const addressPayload = geocoded
      ? this.buildAddress(geocoded)
      : this.buildEmptyAddress(cleanCep);

    // Fallback: if a unit address explicitly contains this CEP, consider it covered.
    // This prevents false negatives when external geocoding providers omit coordinates or fail.
    for (const unit of units) {
      const unitCep = CepUtil.extractFromText(unit.address ?? '');
      if (unitCep && unitCep === cleanCep) {
        return { covered: true, address: addressPayload, unitId: unit.id, unitName: unit.name };
      }
    }

    if (!geocoded?.coordinates) {
      return { covered: false, address: addressPayload, unitId: null, unitName: null };
    }

    for (const unit of units) {
      if (unit.latitude === null || unit.longitude === null) {
        continue;
      }

      const unitCenter = { latitude: unit.latitude, longitude: unit.longitude };
      const covered = GeoUtil.isWithinRadius(
        unitCenter,
        geocoded.coordinates,
        unit.serviceRadiusKm,
      );

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

  private buildEmptyAddress(cep: string) {
    return { cep, street: '', neighborhood: '', city: '', state: '' };
  }
}
