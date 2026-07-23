import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { RawClientDashboardData } from '../../../domain/interfaces/client-dashboard.types.js';
import { GetClientDashboardSummaryUseCase } from './get-client-dashboard-summary.use-case.js';

describe('GetClientDashboardSummaryUseCase', () => {
  let useCase: GetClientDashboardSummaryUseCase;
  let dashboardRepository: { getClientDashboardData: Mock };

  beforeEach(async () => {
    dashboardRepository = {
      getClientDashboardData: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientDashboardSummaryUseCase,
        { provide: DiTokens.clientDashboardRepository, useValue: dashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetClientDashboardSummaryUseCase>(GetClientDashboardSummaryUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return formatted dashboard for client with data', async () => {
    const rawData: RawClientDashboardData = {
      clientName: 'Joao Silva',
      nextAppointment: {
        id: 1,
        date: new Date(2026, 3, 15),
        startTime: '09:00',
        payment: { id: 77, status: 'APPROVED' },
      },
      appointmentsCount: 5,
      recentAppointments: [
        {
          id: 10,
          date: new Date(2026, 2, 10),
          startTime: '14:00',
          status: 'COMPLETED',
          recurrenceType: 'SINGLE',
          locationZip: '22640-102',
          locationAddress: 'Av. das Americas',
          service: { name: 'Faxina Regular', icon: 'broom' },
          unit: { name: 'Le Monde' },
          payment: {
            id: 99,
            amount: 150.0,
            status: 'APPROVED',
            card: { lastFourDigits: '4242' },
          },
        },
      ],
    };

    dashboardRepository.getClientDashboardData.mockResolvedValue(rawData);

    const result = await useCase.getClientDashboardSummary(1);

    expect(result.clientName).toBe('Joao');
    expect(result.nextAppointment).not.toBeNull();
    expect(result.nextAppointment?.date).toBe('15/04');
    expect(result.nextAppointment?.dateTime).toBe('2026-04-15T09:00:00');
    expect(result.nextAppointment?.receiptPaymentId).toBe(77);
    expect(result.serviceHistory[0].entries[0].isoDate).toBe('2026-03-10');
    expect(result.appointmentsCount).toBe(5);
    expect(result.appointmentsCountLabel).toBeDefined();
    expect(result.serviceHistory).toHaveLength(1);
    expect(result.serviceHistory[0].entries).toHaveLength(1);
    expect(result.serviceHistory[0].entries[0].canEdit).toBe(false);
    expect(result.serviceHistory[0].entries[0].payment?.paymentId).toBe(99);
    expect(result.serviceHistory[0].entries[0].payment?.amount).toBe('R$ 150,00');
    expect(result.serviceHistory[0].entries[0].locationName).toBe('Le Monde');
  });

  it('should return null nextAppointment when client has no future appointments', async () => {
    const rawData: RawClientDashboardData = {
      clientName: 'Maria Santos',
      nextAppointment: null,
      appointmentsCount: 0,
      recentAppointments: [],
    };

    dashboardRepository.getClientDashboardData.mockResolvedValue(rawData);

    const result = await useCase.getClientDashboardSummary(2);

    expect(result.clientName).toBe('Maria');
    expect(result.nextAppointment).toBeNull();
    expect(result.appointmentsCount).toBe(0);
    expect(result.serviceHistory).toHaveLength(0);
  });

  it('should propagate NotFoundException when client not found', async () => {
    dashboardRepository.getClientDashboardData.mockRejectedValue(
      new NotFoundException('Client not found'),
    );

    await expect(useCase.getClientDashboardSummary(999)).rejects.toThrow(NotFoundException);
  });

  it('should set canEdit to true for SCHEDULED appointments with an APPROVED payment', async () => {
    const rawData: RawClientDashboardData = {
      clientName: 'Test',
      nextAppointment: null,
      appointmentsCount: 1,
      recentAppointments: [
        {
          id: 20,
          date: new Date(2026, 3, 20),
          startTime: '10:00',
          status: 'SCHEDULED',
          recurrenceType: 'WEEKLY',
          locationZip: null,
          locationAddress: null,
          service: { name: 'Faxina Premium', icon: 'star' },
          unit: null,
          payment: { id: 5, amount: 100, status: 'APPROVED', card: null },
        },
      ],
    };

    dashboardRepository.getClientDashboardData.mockResolvedValue(rawData);

    const result = await useCase.getClientDashboardSummary(3);

    expect(result.serviceHistory[0].entries[0].canEdit).toBe(true);
    expect(result.serviceHistory[0].entries[0].locationName).toBeNull();
  });

  it('should set canEdit to false for SCHEDULED appointments whose payment is not APPROVED', async () => {
    const rawData: RawClientDashboardData = {
      clientName: 'Test',
      nextAppointment: null,
      appointmentsCount: 1,
      recentAppointments: [
        {
          id: 21,
          date: new Date(2026, 3, 21),
          startTime: '10:00',
          status: 'SCHEDULED',
          recurrenceType: 'WEEKLY',
          locationZip: null,
          locationAddress: null,
          service: { name: 'Faxina Premium', icon: 'star' },
          unit: null,
          payment: { id: 6, amount: 100, status: 'PENDING', card: null },
        },
      ],
    };

    dashboardRepository.getClientDashboardData.mockResolvedValue(rawData);

    const result = await useCase.getClientDashboardSummary(3);

    expect(result.serviceHistory[0].entries[0].canEdit).toBe(false);
  });
});
