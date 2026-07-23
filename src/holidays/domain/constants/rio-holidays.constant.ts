export interface LocalHoliday {
  month: number;
  day: number;
  name: string;
  type: 'NATIONAL' | 'STATE' | 'MUNICIPAL' | 'FACULTATIVO';
}

export class RioHolidays {
  static readonly stateMunicipal: LocalHoliday[] = [
    { month: 1, day: 20, name: 'Dia de São Sebastião', type: 'MUNICIPAL' },
    { month: 4, day: 23, name: 'Dia de São Jorge', type: 'MUNICIPAL' },
  ];

  static readonly pontosFacultativos: LocalHoliday[] = [
    { month: 10, day: 15, name: 'Dia do Professor', type: 'FACULTATIVO' },
    { month: 10, day: 28, name: 'Dia do Servidor Público', type: 'FACULTATIVO' },
  ];
}
