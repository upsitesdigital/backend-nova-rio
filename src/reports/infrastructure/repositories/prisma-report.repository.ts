import { Injectable } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  ActiveClientsFilters,
  ActiveClientsResponse,
  ExportFilters,
  ExportRow,
  HoursByServiceFilters,
  HoursByServiceItem,
  IReportRepository,
  SalesSummaryFilters,
  SalesSummaryResponse,
  TransactionGroupItem,
  TransactionsFilters,
} from '../../domain/interfaces/report.repository.interface.js';

interface TransactionRawRow {
  period: string;
  total: number;
  count: bigint;
}

@Injectable()
export class PrismaReportRepository implements IReportRepository {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(filters: SalesSummaryFilters): Promise<SalesSummaryResponse> {
    const where = this.buildPaymentWhere(filters);

    const aggregate = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    });

    return {
      totalRevenue: aggregate._sum.amount ?? 0,
      totalPayments: aggregate._count,
      averageTicket: aggregate._avg.amount ?? 0,
    };
  }

  async getActiveClients(filters: ActiveClientsFilters): Promise<ActiveClientsResponse> {
    const clientWhere: Prisma.ClientWhereInput = {
      status: UserStatus.ACTIVE,
      ...(filters.unitId ? { unitId: filters.unitId } : {}),
    };

    const totalActive = await this.prisma.client.count({ where: clientWhere });

    const unitCounts = await this.prisma.client.groupBy({
      by: ['unitId'],
      where: { status: UserStatus.ACTIVE, unitId: { not: null } },
      _count: true,
    });

    const unitIds = unitCounts.map((uc) => uc.unitId).filter((id): id is number => id !== null);

    const units =
      unitIds.length > 0
        ? await this.prisma.unit.findMany({
            where: { id: { in: unitIds } },
            select: { id: true, name: true },
          })
        : [];

    const unitMap = new Map(units.map((u) => [u.id, u.name]));

    const byUnit = unitCounts
      .filter((uc) => uc.unitId !== null)
      .map((uc) => ({
        unitId: uc.unitId!,
        unitName: unitMap.get(uc.unitId!) ?? '',
        count: uc._count,
      }));

    return { totalActive, byUnit };
  }

  async getHoursByService(filters: HoursByServiceFilters): Promise<HoursByServiceItem[]> {
    const where: Prisma.AppointmentWhereInput = {
      status: AppointmentStatus.COMPLETED,
      ...(filters.unitId ? { unitId: filters.unitId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            date: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const groups = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      where,
      _sum: { duration: true },
    });

    const serviceIds = groups.map((g) => g.serviceId);

    const services =
      serviceIds.length > 0
        ? await this.prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, name: true },
          })
        : [];

    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    return groups.map((g) => ({
      serviceId: g.serviceId,
      serviceName: serviceMap.get(g.serviceId) ?? '',
      totalMinutes: g._sum.duration ?? 0,
    }));
  }

  async getTransactions(filters: TransactionsFilters): Promise<TransactionGroupItem[]> {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`status = ${PaymentStatus.APPROVED}::"PaymentStatus"`,
    ];

    if (filters.dateFrom) {
      conditions.push(Prisma.sql`"paidAt" >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(Prisma.sql`"paidAt" <= ${filters.dateTo}`);
    }
    if (filters.unitId) {
      conditions.push(
        Prisma.sql`"appointmentId" IN (SELECT id FROM appointments WHERE "unitId" = ${filters.unitId})`,
      );
    }
    if (filters.serviceId) {
      conditions.push(
        Prisma.sql`"appointmentId" IN (SELECT id FROM appointments WHERE "serviceId" = ${filters.serviceId})`,
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');
    const rows = await this.queryTransactionGroups(filters.groupBy, whereClause);

    return rows.map((row) => ({
      period: row.period,
      total: row.total,
      count: Number(row.count),
    }));
  }

  private queryTransactionGroups(
    groupBy: TransactionsFilters['groupBy'],
    whereClause: Prisma.Sql,
  ): Promise<TransactionRawRow[]> {
    switch (groupBy) {
      case 'day':
        return this.prisma.$queryRaw<TransactionRawRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('day', COALESCE("paidAt", "createdAt")), 'YYYY-MM-DD') AS period,
            SUM(amount)::float AS total,
            COUNT(*)::bigint AS count
          FROM payments
          WHERE ${whereClause}
          GROUP BY period
          ORDER BY period ASC`;
      case 'week':
        return this.prisma.$queryRaw<TransactionRawRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('week', COALESCE("paidAt", "createdAt")), 'YYYY-MM-DD') AS period,
            SUM(amount)::float AS total,
            COUNT(*)::bigint AS count
          FROM payments
          WHERE ${whereClause}
          GROUP BY period
          ORDER BY period ASC`;
      default:
        return this.prisma.$queryRaw<TransactionRawRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('month', COALESCE("paidAt", "createdAt")), 'YYYY-MM-DD') AS period,
            SUM(amount)::float AS total,
            COUNT(*)::bigint AS count
          FROM payments
          WHERE ${whereClause}
          GROUP BY period
          ORDER BY period ASC`;
    }
  }

  async getExportRows(filters: ExportFilters): Promise<ExportRow[]> {
    const where = this.buildPaymentWhere(filters);

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        id: true,
        paidAt: true,
        amount: true,
        method: true,
        status: true,
        client: { select: { name: true } },
        appointment: {
          select: {
            date: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: 'asc' },
    });

    return payments.map((p) => ({
      paymentId: p.id,
      paidAt: p.paidAt,
      amount: p.amount,
      method: p.method,
      status: p.status,
      clientName: p.client.name,
      serviceName: p.appointment.service.name,
      appointmentDate: p.appointment.date,
    }));
  }

  private buildPaymentWhere(
    filters: Pick<SalesSummaryFilters, 'dateFrom' | 'dateTo' | 'unitId' | 'serviceId'>,
  ): Prisma.PaymentWhereInput {
    return {
      status: PaymentStatus.APPROVED,
      ...(filters.dateFrom || filters.dateTo
        ? {
            paidAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
      ...(filters.unitId || filters.serviceId
        ? {
            appointment: {
              ...(filters.unitId ? { unitId: filters.unitId } : {}),
              ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
            },
          }
        : {}),
    };
  }
}
