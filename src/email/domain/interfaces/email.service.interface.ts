export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<void>;
  sendPasswordResetCode(to: string, name: string, code: string): Promise<void>;
  sendPasswordChangedEmail(to: string, name: string): Promise<void>;
  sendClientApprovedEmail(to: string, name: string): Promise<void>;
  sendClientRejectedEmail(to: string, name: string): Promise<void>;
  sendEmailChangeVerification(to: string, name: string, code: string): Promise<void>;
  sendEmailChangedEmail(to: string, name: string, newEmail: string): Promise<void>;
  sendAccountDeletedEmail(to: string, name: string): Promise<void>;
  sendAppointmentConfirmedEmail(
    to: string,
    name: string,
    date: string,
    time: string,
    serviceName: string,
  ): Promise<void>;
  sendAppointmentCancelledEmail(
    to: string,
    name: string,
    date: string,
    time: string,
    serviceName: string,
  ): Promise<void>;
  sendAppointmentRescheduledEmail(
    to: string,
    name: string,
    newDate: string,
    newTime: string,
    serviceName: string,
  ): Promise<void>;
  sendPaymentApprovedEmail(
    to: string,
    name: string,
    amount: string,
    serviceName: string,
    date: string,
  ): Promise<void>;
  sendPaymentCancelledEmail(
    to: string,
    name: string,
    amount: string,
    serviceName: string,
  ): Promise<void>;
}
