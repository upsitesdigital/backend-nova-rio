import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
    const clientWhere: Prisma.ClientWhereInput = { status: 'ACTIVE' };
    if (filters.unitId) clientWhere.unitId = filters.unitId;

    const totalActive = await this.prisma.client.count({ where: clientWhere });

    const unitCounts = await this.prisma.client.groupBy({
      by: ['unitId'],
      where: { status: 'ACTIVE', unitId: { not: null } },
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
    const where: Prisma.AppointmentWhereInput = { status: 'COMPLETED' };

    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

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
    const where = this.buildPaymentWhere(filters);

    const payments = await this.prisma.payment.findMany({
      where,
      select: { amount: true, paidAt: true, createdAt: true },
      orderBy: { paidAt: 'asc' },
    });

    const grouped = new Map<string, { total: number; count: number }>();

    for (const payment of payments) {
      const date = payment.paidAt ?? payment.createdAt;
      const period = this.truncateDate(date, filters.groupBy);
      const existing = grouped.get(period) ?? { total: 0, count: 0 };
      existing.total += Number(payment.amount);
      existing.count += 1;
      grouped.set(period, existing);
    }

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      total: data.total,
      count: data.count,
    }));
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
    const where: Prisma.PaymentWhereInput = { status: 'APPROVED' };

    if (filters.dateFrom || filters.dateTo) {
      where.paidAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    if (filters.unitId || filters.serviceId) {
      where.appointment = {
        ...(filters.unitId ? { unitId: filters.unitId } : {}),
        ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
      };
    }

    return where;
  }

  private truncateDate(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');

    if (groupBy === 'day') {
      return `${year}-${month}-${day}`;
    }

    if (groupBy === 'week') {
      const dayOfWeek = d.getUTCDay();
      const monday = new Date(d);
      monday.setUTCDate(d.getUTCDate() - ((dayOfWeek + 6) % 7));
      const wy = monday.getUTCFullYear();
      const wm = String(monday.getUTCMonth() + 1).padStart(2, '0');
      const wd = String(monday.getUTCDate()).padStart(2, '0');
      return `${wy}-${wm}-${wd}`;
    }

    return `${year}-${month}`;
  }
}
