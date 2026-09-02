import { baseLayout } from './base-layout.js';

export function adminAccountDeletedTemplate(clientName: string, clientEmail: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Conta de cliente excluída
    </h1>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Um cliente excluiu a própria conta da plataforma:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#0a0a0a;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 12px 0;font-family:'Work Sans',Arial,sans-serif;font-size:13px;font-weight:500;color:#aaaaaa;text-transform:uppercase;letter-spacing:2px;">
            Conta excluída
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
  `);
}
