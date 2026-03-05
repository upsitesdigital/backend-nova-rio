import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  type IClientRepository,
} from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { CreatePublicAppointmentDto } from '../../../dto/appointment/create-public-appointment.dto.js';
import type { AppointmentResponse } from '../../../domain/interfaces/appointment.repository.interface.js';
import { CreateClientAppointmentUseCase } from './create-client-appointment.use-case.js';

@Injectable()
export class CreatePublicAppointmentUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    private createClientAppointmentUseCase: CreateClientAppointmentUseCase,
  ) {}

  async createPublicAppointment(dto: CreatePublicAppointmentDto): Promise<AppointmentResponse> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new NotFoundException('Client not found for the provided email');
    }

    return this.createClientAppointmentUseCase.createClientAppointment(client.id, dto);
  }
}
