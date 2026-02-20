import { baseLayout } from './base-layout.js';

export function emailChangeVerificationTemplate(name: string, code: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Verificação de novo e-mail
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Recebemos uma solicitação para alterar o e-mail da sua conta. Use o código abaixo para confirmar a alteração:
    </p>
    <!-- Code box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td align="center" style="background-color:#0a0a0a;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:13px;font-weight:500;color:#00A77E;text-transform:uppercase;letter-spacing:2px;">
            Código de verificação
          </p>
          <p style="margin:0;font-family:'Work Sans',monospace;font-size:36px;font-weight:600;color:#ffffff;letter-spacing:8px;">
            ${code}
          </p>
        </td>
      </tr>
    </table>
    <!-- Warning box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#fff8f0;border-left:4px solid #e8a23e;border-radius:0 8px 8px 0;padding:16px 24px;">
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#8a6d3b;line-height:1.5;">
            <strong>Atenção:</strong> Este código expira em <strong>15 minutos</strong>. Não compartilhe este código com ninguém.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Se você não solicitou a alteração de e-mail, ignore esta mensagem. Seu e-mail permanecerá inalterado.
    </p>
  `);
}
