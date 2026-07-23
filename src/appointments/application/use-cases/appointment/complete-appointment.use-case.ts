import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import type {
  AppointmentResponse,
  IAppointmentRepository,
} from '../../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
  ) {}

  async completeAppointmentById(id: number): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findAppointmentById(id);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be completed');
    }

    if (existing.payment?.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('Only appointments with an approved payment can be completed');
    }

    const completed = await this.appointmentRepository.completeAppointmentById(id);
    if (completed === null) {
      throw new BadRequestException('Only scheduled appointments can be completed');
    }

    return completed;
  }
}
