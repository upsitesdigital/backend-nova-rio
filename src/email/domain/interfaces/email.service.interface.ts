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

  // Admin notifications
  sendAdminNewClientEmail(to: string, clientName: string, clientEmail: string): Promise<void>;
  sendAdminNewAppointmentEmail(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<void>;
  sendAdminAppointmentCancelledEmail(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<void>;
  sendAdminAppointmentRescheduledEmail(
    to: string,
    clientName: string,
    serviceName: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string,
  ): Promise<void>;
  sendAdminPaymentReceivedEmail(
    to: string,
    clientName: string,
    serviceName: string,
    amount: string,
    date: string,
  ): Promise<void>;
  sendAdminPaymentCancelledEmail(
    to: string,
    clientName: string,
    serviceName: string,
    amount: string,
  ): Promise<void>;
  sendAdminAccountDeletedEmail(to: string, clientName: string, clientEmail: string): Promise<void>;
}
