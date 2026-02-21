import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { IEmailService } from '../../domain/interfaces/email.service.interface.js';
import { welcomeTemplate } from '../templates/welcome.template.js';
import { passwordResetTemplate } from '../templates/password-reset.template.js';
import { passwordChangedTemplate } from '../templates/password-changed.template.js';
import { clientApprovedTemplate } from '../templates/client-approved.template.js';
import { clientRejectedTemplate } from '../templates/client-rejected.template.js';
import { emailChangeVerificationTemplate } from '../templates/email-change-verification.template.js';
import { accountDeletedTemplate } from '../templates/account-deleted.template.js';
import { appointmentConfirmedTemplate } from '../templates/appointment-confirmed.template.js';
import { appointmentCancelledTemplate } from '../templates/appointment-cancelled.template.js';
import { appointmentRescheduledTemplate } from '../templates/appointment-rescheduled.template.js';
import { paymentApprovedTemplate } from '../templates/payment-approved.template.js';
import { paymentCancelledTemplate } from '../templates/payment-cancelled.template.js';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(ResendEmailService.name);

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
  }

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
      this.logger.error(`Failed to send welcome email to ${this.maskEmail(to)}`, error);
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
      this.logger.error(`Failed to send password reset email to ${this.maskEmail(to)}`, error);
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
      this.logger.error(`Failed to send client approved email to ${this.maskEmail(to)}`, error);
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
      this.logger.error(`Failed to send client rejected email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Senha alterada com sucesso - Nova Rio',
        html: passwordChangedTemplate(name),
      });
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendEmailChangeVerification(to: string, name: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Verificação de novo e-mail - Nova Rio',
        html: emailChangeVerificationTemplate(name, code),
      });
    } catch (error) {
      this.logger.error(`Failed to send email change verification to ${this.maskEmail(to)}`, error);
    }
  }

  async sendAccountDeletedEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Conta excluída - Nova Rio',
        html: accountDeletedTemplate(name),
      });
    } catch (error) {
      this.logger.error(`Failed to send account deleted email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendAppointmentConfirmedEmail(
    to: string,
    name: string,
    date: string,
    time: string,
    serviceName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Agendamento confirmado - Nova Rio',
        html: appointmentConfirmedTemplate(name, date, time, serviceName),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmed email to ${this.maskEmail(to)}`,
        error,
      );
    }
  }

  async sendAppointmentCancelledEmail(
    to: string,
    name: string,
    date: string,
    time: string,
    serviceName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Agendamento cancelado - Nova Rio',
        html: appointmentCancelledTemplate(name, date, time, serviceName),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send appointment cancelled email to ${this.maskEmail(to)}`,
        error,
      );
    }
  }

  async sendAppointmentRescheduledEmail(
    to: string,
    name: string,
    newDate: string,
    newTime: string,
    serviceName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Agendamento reagendado - Nova Rio',
        html: appointmentRescheduledTemplate(name, newDate, newTime, serviceName),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send appointment rescheduled email to ${this.maskEmail(to)}`,
        error,
      );
    }
  }

  async sendPaymentApprovedEmail(
    to: string,
    name: string,
    amount: string,
    serviceName: string,
    date: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Pagamento confirmado - Nova Rio',
        html: paymentApprovedTemplate(name, amount, serviceName, date),
      });
    } catch (error) {
      this.logger.error(`Failed to send payment approved email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendPaymentCancelledEmail(
    to: string,
    name: string,
    amount: string,
    serviceName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Pagamento cancelado - Nova Rio',
        html: paymentCancelledTemplate(name, amount, serviceName),
      });
    } catch (error) {
      this.logger.error(`Failed to send payment cancelled email to ${this.maskEmail(to)}`, error);
    }
  }
}
