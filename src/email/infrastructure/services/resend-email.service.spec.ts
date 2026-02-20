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
});
