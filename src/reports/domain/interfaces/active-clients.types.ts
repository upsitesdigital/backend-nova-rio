export interface ActiveClientsFilters {
  unitId?: number;
}

export interface UnitClientCount {
  unitId: number;
  unitName: string;
  count: number;
}

export interface ActiveClientsResponse {
  totalActive: number;
  byUnit: UnitClientCount[];
}
