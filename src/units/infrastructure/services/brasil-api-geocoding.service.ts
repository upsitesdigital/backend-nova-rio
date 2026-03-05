import { Injectable, Logger } from '@nestjs/common';
import type {
  GeocodedAddress,
  IGeocodingService,
} from '../../domain/interfaces/geocoding.service.interface.js';

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

@Injectable()
export class BrasilApiGeocodingService implements IGeocodingService {
  private readonly logger = new Logger(BrasilApiGeocodingService.name);

  async geocodeByCep(cep: string): Promise<GeocodedAddress> {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);

    if (!response.ok) {
      throw new Error(`CEP not found: ${cleanCep}`);
    }

    const data = (await response.json()) as BrasilApiCepResponse;

    const lat = data.location?.coordinates?.latitude
      ? Number(data.location.coordinates.latitude)
      : null;
    const lng = data.location?.coordinates?.longitude
      ? Number(data.location.coordinates.longitude)
      : null;

    if (lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      return {
        cep: data.cep,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        coordinates: { latitude: lat, longitude: lng },
      };
    }

    this.logger.warn(`No coordinates available for CEP ${cleanCep}`);

    return {
      cep: data.cep,
      street: data.street,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      coordinates: null,
    };
  }
}
