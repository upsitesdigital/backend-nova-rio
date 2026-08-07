import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { IEmailService } from '../../domain/interfaces/email.service.interface.js';
import { welcomeTemplate } from '../templates/welcome.template.js';
import { passwordResetTemplate } from '../templates/password-reset.template.js';
import { passwordChangedTemplate } from '../templates/password-changed.template.js';
import { clientApprovedTemplate } from '../templates/client-approved.template.js';
import { clientRejectedTemplate } from '../templates/client-rejected.template.js';
import { emailChangeVerificationTemplate } from '../templates/email-change-verification.template.js';
import { emailChangedTemplate } from '../templates/email-changed.template.js';
import { accountDeletedTemplate } from '../templates/account-deleted.template.js';
import { appointmentConfirmedTemplate } from '../templates/appointment-confirmed.template.js';
import { appointmentCancelledTemplate } from '../templates/appointment-cancelled.template.js';
import { appointmentRescheduledTemplate } from '../templates/appointment-rescheduled.template.js';
import { paymentApprovedTemplate } from '../templates/payment-approved.template.js';
import { paymentCancelledTemplate } from '../templates/payment-cancelled.template.js';

@Injectable()
export class Smtp2goEmailService implements IEmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly logger = new Logger(Smtp2goEmailService.name);

  constructor(private configService: ConfigService) {
    const port = this.configService.getOrThrow<number>('SMTP2GO_PORT');
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP2GO_HOST'),
      port,
      secure: port === 465 || port === 8465,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP2GO_USER'),
        pass: this.configService.getOrThrow<string>('SMTP2GO_PASS'),
      },
    });
    this.from = this.configService.getOrThrow<string>('SMTP2GO_FROM_EMAIL');
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.send(to, 'Bem-vindo à Nova Rio!', welcomeTemplate(name));
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendPasswordResetCode(to: string, name: string, code: string): Promise<void> {
    try {
      await this.send(
        to,
        'Código de recuperação de senha - Nova Rio',
        passwordResetTemplate(name, code),
      );
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendClientApprovedEmail(to: string, name: string): Promise<void> {
    try {
      await this.send(to, 'Cadastro aprovado - Nova Rio', clientApprovedTemplate(name));
    } catch (error) {
      this.logger.error(`Failed to send client approved email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendClientRejectedEmail(to: string, name: string): Promise<void> {
    try {
      await this.send(to, 'Cadastro não aprovado - Nova Rio', clientRejectedTemplate(name));
    } catch (error) {
      this.logger.error(`Failed to send client rejected email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    try {
      await this.send(to, 'Senha alterada com sucesso - Nova Rio', passwordChangedTemplate(name));
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${this.maskEmail(to)}`, error);
    }
  }

  async sendEmailChangeVerification(to: string, name: string, code: string): Promise<void> {
    try {
      await this.send(
        to,
        'Verificação de novo e-mail - Nova Rio',
        emailChangeVerificationTemplate(name, code),
      );
    } catch (error) {
      this.logger.error(`Failed to send email change verification to ${this.maskEmail(to)}`, error);
    }
  }

  async sendEmailChangedEmail(to: string, name: string, newEmail: string): Promise<void> {
    try {
      await this.send(
        to,
        'E-mail alterado com sucesso - Nova Rio',
        emailChangedTemplate(name, newEmail),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email changed notification to ${this.maskEmail(to)}`,
        error,
      );
    }
  }

  async sendAccountDeletedEmail(to: string, name: string): Promise<void> {
    try {
      await this.send(to, 'Conta excluída - Nova Rio', accountDeletedTemplate(name));
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
      await this.send(
        to,
        'Agendamento confirmado - Nova Rio',
        appointmentConfirmedTemplate(name, date, time, serviceName),
      );
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
      await this.send(
        to,
        'Agendamento cancelado - Nova Rio',
        appointmentCancelledTemplate(name, date, time, serviceName),
      );
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
      await this.send(
        to,
        'Agendamento reagendado - Nova Rio',
        appointmentRescheduledTemplate(name, newDate, newTime, serviceName),
      );
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
      await this.send(
        to,
        'Pagamento confirmado - Nova Rio',
        paymentApprovedTemplate(name, amount, serviceName, date),
      );
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
      await this.send(
        to,
        'Pagamento cancelado - Nova Rio',
        paymentCancelledTemplate(name, amount, serviceName),
      );
    } catch (error) {
      this.logger.error(`Failed to send payment cancelled email to ${this.maskEmail(to)}`, error);
    }
  }
}
