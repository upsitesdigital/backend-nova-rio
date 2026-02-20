import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { IEmailService } from '../../domain/interfaces/email.service.interface.js';
import { welcomeTemplate } from '../templates/welcome.template.js';
import { passwordResetTemplate } from '../templates/password-reset.template.js';
import { clientApprovedTemplate } from '../templates/client-approved.template.js';
import { clientRejectedTemplate } from '../templates/client-rejected.template.js';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(ResendEmailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.from = this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@novario.com';
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Bem-vindo à Nova Rio!',
        html: welcomeTemplate(name),
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }

  async sendPasswordResetCode(to: string, name: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Código de recuperação de senha - Nova Rio',
        html: passwordResetTemplate(name, code),
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendClientApprovedEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Cadastro aprovado - Nova Rio',
        html: clientApprovedTemplate(name),
      });
    } catch (error) {
      this.logger.error(`Failed to send client approved email to ${to}`, error);
    }
  }

  async sendClientRejectedEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Cadastro não aprovado - Nova Rio',
        html: clientRejectedTemplate(name),
      });
    } catch (error) {
      this.logger.error(`Failed to send client rejected email to ${to}`, error);
    }
  }
}
