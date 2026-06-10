import type { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export interface ExportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  unitId?: number;
  serviceId?: number;
}

export interface ExportRow {
  paymentId: number;
  paidAt: Date | null;
  amount: Prisma.Decimal;
  method: PaymentMethod;
  status: PaymentStatus;
  clientName: string;
  serviceName: string;
  appointmentDate: Date;
}
