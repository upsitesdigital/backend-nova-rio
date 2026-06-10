import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { EmailAlreadyInUseError } from '../../../domain/errors/email-already-in-use.error.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { ClientRegisterDto } from '../../../dto/client-register.dto.js';

@Injectable()
export class ClientRegisterUseCase {
  constructor(
    @Inject(DiTokens.clientAuthRepository) private clientRepository: IClientAuthRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
    @Inject(DiTokens.hashService) private hashService: IHashService,
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
      if (error instanceof EmailAlreadyInUseError) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}
