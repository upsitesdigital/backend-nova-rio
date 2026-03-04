import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResendEmailService } from './resend-email.service.js';

const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

describe('ResendEmailService', () => {
  let service: ResendEmailService;
  let configService: { get: Mock };

  beforeEach(async () => {
    mockSend.mockReset();

    configService = {
      get: vi.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          RESEND_API_KEY: 'test-api-key',
          RESEND_FROM_EMAIL: 'test@novario.com',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ResendEmailService, { provide: ConfigService, useValue: configService }],
    }).compile();

    service = module.get<ResendEmailService>(ResendEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct params', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendWelcomeEmail('client@example.com', 'João');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: 'Bem-vindo à Nova Rio!',
        html: expect.stringContaining('João') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(service.sendWelcomeEmail('client@example.com', 'João')).resolves.toBeUndefined();
    });
  });

  describe('sendPasswordResetCode', () => {
    it('should send password reset email with code', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendPasswordResetCode('client@example.com', 'João', '123456');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('recuperação') as string,
        html: expect.stringContaining('123456') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendPasswordResetCode('client@example.com', 'João', '123456'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendClientApprovedEmail', () => {
    it('should send approved email with correct params', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendClientApprovedEmail('client@example.com', 'João');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('aprovado') as string,
        html: expect.stringContaining('João') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendClientApprovedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendClientRejectedEmail', () => {
    it('should send rejected email with correct params', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendClientRejectedEmail('client@example.com', 'João');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('não aprovado') as string,
        html: expect.stringContaining('João') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendClientRejectedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPasswordChangedEmail', () => {
    it('should send password changed email with correct params', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendPasswordChangedEmail('client@example.com', 'João');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('Senha alterada') as string,
        html: expect.stringContaining('João') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendPasswordChangedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendEmailChangeVerification', () => {
    it('should send email change verification with code', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendEmailChangeVerification('new@example.com', 'João', '654321');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'new@example.com',
        subject: expect.stringContaining('Verificação') as string,
        html: expect.stringContaining('654321') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendEmailChangeVerification('new@example.com', 'João', '654321'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendEmailChangedEmail', () => {
    it('should send email changed notification with new email', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendEmailChangedEmail('old@example.com', 'João', 'new@example.com');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'old@example.com',
        subject: expect.stringContaining('alterado') as string,
        html: expect.stringContaining('new@example.com') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendEmailChangedEmail('old@example.com', 'João', 'new@example.com'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAccountDeletedEmail', () => {
    it('should send account deleted email with correct params', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendAccountDeletedEmail('client@example.com', 'João');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('excluída') as string,
        html: expect.stringContaining('João') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendAccountDeletedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAppointmentConfirmedEmail', () => {
    it('should send appointment confirmed email with details', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendAppointmentConfirmedEmail(
        'client@example.com',
        'João',
        '25/02/2026',
        '14:00',
        'Limpeza Padrão',
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('confirmado') as string,
        html: expect.stringContaining('Limpeza Padrão') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendAppointmentConfirmedEmail(
          'client@example.com',
          'João',
          '25/02/2026',
          '14:00',
          'Limpeza',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAppointmentCancelledEmail', () => {
    it('should send appointment cancelled email with details', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendAppointmentCancelledEmail(
        'client@example.com',
        'João',
        '25/02/2026',
        '14:00',
        'Limpeza Padrão',
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('cancelado') as string,
        html: expect.stringContaining('Limpeza Padrão') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendAppointmentCancelledEmail(
          'client@example.com',
          'João',
          '25/02/2026',
          '14:00',
          'Limpeza',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAppointmentRescheduledEmail', () => {
    it('should send appointment rescheduled email with new details', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendAppointmentRescheduledEmail(
        'client@example.com',
        'João',
        '28/02/2026',
        '16:00',
        'Limpeza Padrão',
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('reagendado') as string,
        html: expect.stringContaining('28/02/2026') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendAppointmentRescheduledEmail(
          'client@example.com',
          'João',
          '28/02/2026',
          '16:00',
          'Limpeza',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPaymentApprovedEmail', () => {
    it('should send payment approved email with amount', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendPaymentApprovedEmail(
        'client@example.com',
        'João',
        '150,00',
        'Limpeza Padrão',
        '25/02/2026',
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('confirmado') as string,
        html: expect.stringContaining('150,00') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendPaymentApprovedEmail(
          'client@example.com',
          'João',
          '150,00',
          'Limpeza',
          '25/02/2026',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPaymentCancelledEmail', () => {
    it('should send payment cancelled email with details', async () => {
      mockSend.mockResolvedValue({ id: 'email-id' });

      await service.sendPaymentCancelledEmail(
        'client@example.com',
        'João',
        '150,00',
        'Limpeza Padrão',
      );

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@novario.com',
        to: 'client@example.com',
        subject: expect.stringContaining('cancelado') as string,
        html: expect.stringContaining('150,00') as string,
      });
    });

    it('should not throw on error', async () => {
      mockSend.mockRejectedValue(new Error('API error'));

      await expect(
        service.sendPaymentCancelledEmail('client@example.com', 'João', '150,00', 'Limpeza'),
      ).resolves.toBeUndefined();
    });
  });
});
