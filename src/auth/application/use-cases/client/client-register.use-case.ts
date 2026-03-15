import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CLIENT_AUTH_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { ClientRegisterDto } from '../../../dto/client-register.dto.js';

@Injectable()
export class ClientRegisterUseCase {
  constructor(
    @Inject(CLIENT_AUTH_REPOSITORY) private clientRepository: IClientAuthRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
    @Inject(HASH_SERVICE) private hashService: IHashService,
  ) {}

  async registerClient(dto: ClientRegisterDto): Promise<{ message: string }> {
    const existing = await this.clientRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    try {
      await this.clientRepository.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
      });

      void this.emailService.sendWelcomeEmail(dto.email, dto.name);

      return { message: 'Registration successful. Your account is pending approval.' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}
