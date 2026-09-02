import { baseLayout } from './base-layout.js';

export function adminNewClientTemplate(clientName: string, clientEmail: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Novo cliente aguardando aprovação
    </h1>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Um novo cliente se cadastrou na plataforma e está aguardando aprovação:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#0a0a0a;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 12px 0;font-family:'Work Sans',Arial,sans-serif;font-size:13px;font-weight:500;color:#00A77E;text-transform:uppercase;letter-spacing:2px;">
            Dados do cliente
          </p>
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;font-weight:600;color:#ffffff;">
            ${clientName}
          </p>
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;">
            ${clientEmail}
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#fff8f0;border-left:4px solid #e8a23e;border-radius:0 8px 8px 0;padding:16px 24px;">
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#8a6d3b;line-height:1.5;">
            <strong>Ação necessária:</strong> Acesse o painel administrativo para aprovar ou reprovar este cadastro.
          </p>
        </td>
      </tr>
    </table>
  `);
}
