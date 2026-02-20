export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<void>;
  sendPasswordResetCode(to: string, name: string, code: string): Promise<void>;
  sendClientApprovedEmail(to: string, name: string): Promise<void>;
  sendClientRejectedEmail(to: string, name: string): Promise<void>;
}
