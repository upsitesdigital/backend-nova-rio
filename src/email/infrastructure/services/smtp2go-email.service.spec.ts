import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Smtp2goEmailService } from './smtp2go-email.service.js';

const mockSendMail = vi.fn();
vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
}));

describe('Smtp2goEmailService', () => {
  let service: Smtp2goEmailService;
  let configService: { getOrThrow: Mock };

  beforeEach(async () => {
    mockSendMail.mockReset();

    configService = {
      getOrThrow: vi.fn().mockImplementation((key: string) => {
        const config: Record<string, string | number> = {
          SMTP2GO_HOST: 'mail.smtp2go.com',
          SMTP2GO_PORT: 465,
          SMTP2GO_USER: 'ppu.novario.com.br',
          SMTP2GO_PASS: 'test-pass',
          SMTP2GO_FROM_EMAIL: 'Nova Rio <noreply@novario.com.br>',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [Smtp2goEmailService, { provide: ConfigService, useValue: configService }],
    }).compile();

    service = module.get<Smtp2goEmailService>(Smtp2goEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct params', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendWelcomeEmail('client@example.com', 'João');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: 'Bem-vindo à Nova Rio!',
          html: expect.stringContaining('João') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(service.sendWelcomeEmail('client@example.com', 'João')).resolves.toBeUndefined();
    });
  });

  describe('sendPasswordResetCode', () => {
    it('should send password reset email with code', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendPasswordResetCode('client@example.com', 'João', '123456');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: expect.stringContaining('recuperação') as string,
          html: expect.stringContaining('123456') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendPasswordResetCode('client@example.com', 'João', '123456'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendClientApprovedEmail', () => {
    it('should send approved email with correct params', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendClientApprovedEmail('client@example.com', 'João');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('aprovado') as string,
          html: expect.stringContaining('João') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendClientApprovedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendClientRejectedEmail', () => {
    it('should send rejected email with correct params', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendClientRejectedEmail('client@example.com', 'João');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('não aprovado') as string,
          html: expect.stringContaining('João') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendClientRejectedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPasswordChangedEmail', () => {
    it('should send password changed email', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendPasswordChangedEmail('client@example.com', 'João');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Senha alterada') as string,
          html: expect.stringContaining('João') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendPasswordChangedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendEmailChangeVerification', () => {
    it('should send email change verification with code', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendEmailChangeVerification('new@example.com', 'João', '654321');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Verificação') as string,
          html: expect.stringContaining('654321') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendEmailChangeVerification('new@example.com', 'João', '654321'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendEmailChangedEmail', () => {
    it('should send email changed notification with new email', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendEmailChangedEmail('old@example.com', 'João', 'new@example.com');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('alterado') as string,
          html: expect.stringContaining('new@example.com') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendEmailChangedEmail('old@example.com', 'João', 'new@example.com'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAccountDeletedEmail', () => {
    it('should send account deleted email', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendAccountDeletedEmail('client@example.com', 'João');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('excluída') as string,
          html: expect.stringContaining('João') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendAccountDeletedEmail('client@example.com', 'João'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendAppointmentConfirmedEmail', () => {
    it('should send appointment confirmed email with details', async () => {
      mockSendMail.mockResolvedValue({});

      await service.sendAppointmentConfirmedEmail(
        'client@example.com',
        'João',
        '25/02/2026',
        '14:00',
        'Limpeza Padrão',
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('confirmado') as string,
          html: expect.stringContaining('Limpeza Padrão') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

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
      mockSendMail.mockResolvedValue({});

      await service.sendAppointmentCancelledEmail(
        'client@example.com',
        'João',
        '25/02/2026',
        '14:00',
        'Limpeza Padrão',
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('cancelado') as string,
          html: expect.stringContaining('Limpeza Padrão') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

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
      mockSendMail.mockResolvedValue({});

      await service.sendAppointmentRescheduledEmail(
        'client@example.com',
        'João',
        '28/02/2026',
        '16:00',
        'Limpeza Padrão',
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('reagendado') as string,
          html: expect.stringContaining('28/02/2026') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

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
      mockSendMail.mockResolvedValue({});

      await service.sendPaymentApprovedEmail(
        'client@example.com',
        'João',
        '150,00',
        'Limpeza Padrão',
        '25/02/2026',
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('confirmado') as string,
          html: expect.stringContaining('150,00') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

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
      mockSendMail.mockResolvedValue({});

      await service.sendPaymentCancelledEmail(
        'client@example.com',
        'João',
        '150,00',
        'Limpeza Padrão',
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('cancelado') as string,
          html: expect.stringContaining('150,00') as string,
        }),
      );
    });

    it('should not throw on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendPaymentCancelledEmail('client@example.com', 'João', '150,00', 'Limpeza'),
      ).resolves.toBeUndefined();
    });
  });
});
