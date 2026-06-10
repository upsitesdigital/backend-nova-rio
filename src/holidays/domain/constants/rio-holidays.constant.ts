export type HolidayType = 'national' | 'state' | 'municipal' | 'facultativo';

export interface LocalHoliday {
  month: number;
  day: number;
  name: string;
  type: HolidayType;
}

export class RioHolidays {
  static readonly stateMunicipal: LocalHoliday[] = [
    { month: 1, day: 20, name: 'Dia de São Sebastião', type: 'municipal' },
    { month: 4, day: 23, name: 'Dia de São Jorge', type: 'municipal' },
  ];

  static readonly pontosFacultativos: LocalHoliday[] = [
    { month: 10, day: 15, name: 'Dia do Professor', type: 'facultativo' },
    { month: 10, day: 28, name: 'Dia do Servidor Público', type: 'facultativo' },
  ];
}
