import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IClientAuthRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { CreatePublicAppointmentDto } from '../../../dto/appointment/create-public-appointment.dto.js';
import type { AppointmentResponse } from '../../../domain/interfaces/appointment.repository.interface.js';
import { type ICreateClientAppointmentService } from '../../../domain/interfaces/create-client-appointment.service.interface.js';

@Injectable()
export class CreatePublicAppointmentUseCase {
  constructor(
    @Inject(DiTokens.clientAuthRepository) private clientRepository: IClientAuthRepository,
    @Inject(DiTokens.createClientAppointmentService)
    private createClientAppointmentService: ICreateClientAppointmentService,
  ) {}

  async createPublicAppointment(dto: CreatePublicAppointmentDto): Promise<AppointmentResponse> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException(
        'Unable to create appointment. Please verify your information.',
      );
    }

    return this.createClientAppointmentService.createClientAppointment(client.id, dto);
  }
}
