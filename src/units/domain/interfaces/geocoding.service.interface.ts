import type { Coordinates } from '../../../shared/geo/geo.util.js';

export const GEOCODING_SERVICE = Symbol('GEOCODING_SERVICE');

export interface GeocodedAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  coordinates: Coordinates | null;
}

export interface IGeocodingService {
  geocodeByCep(cep: string): Promise<GeocodedAddress>;
}
