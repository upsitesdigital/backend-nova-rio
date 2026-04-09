import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_AUTH_REPOSITORY,
  type IClientAuthRepository,
} from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { CreatePublicAppointmentDto } from '../../../dto/appointment/create-public-appointment.dto.js';
import type { AppointmentResponse } from '../../../domain/interfaces/appointment.repository.interface.js';
import { CreateClientAppointmentUseCase } from './create-client-appointment.use-case.js';

@Injectable()
export class CreatePublicAppointmentUseCase {
  constructor(
    @Inject(CLIENT_AUTH_REPOSITORY) private clientRepository: IClientAuthRepository,
    private createClientAppointmentUseCase: CreateClientAppointmentUseCase,
  ) {}

  async createPublicAppointment(dto: CreatePublicAppointmentDto): Promise<AppointmentResponse> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException(
        'Unable to create appointment. Please verify your information.',
      );
    }

    return this.createClientAppointmentUseCase.createClientAppointment(client.id, dto);
  }
}
