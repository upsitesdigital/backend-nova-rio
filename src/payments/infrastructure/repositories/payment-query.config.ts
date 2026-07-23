export class PaymentQueryConfig {
  static readonly include = {
    client: { select: { id: true, name: true, email: true, cpfCnpj: true } },
    appointment: {
      select: {
        id: true,
        date: true,
        startTime: true,
        service: { select: { id: true, name: true } },
        recurrenceType: true,
      },
    },
    card: { select: { id: true, lastFourDigits: true, brand: true } },
  } as const;
}
