import { baseLayout } from './base-layout.js';

export function adminPaymentCancelledTemplate(
  clientName: string,
  serviceName: string,
  amount: string,
): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Pagamento cancelado
    </h1>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Um pagamento foi cancelado na plataforma:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#0a0a0a;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 12px 0;font-family:'Work Sans',Arial,sans-serif;font-size:13px;font-weight:500;color:#e85555;text-transform:uppercase;letter-spacing:2px;">
            Pagamento cancelado
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;width:100px;">Cliente</td>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;">Serviço</td>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;">Valor</td>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#e85555;">R$ ${amount}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Verifique se é necessário entrar em contato com o cliente.
    </p>
  `);
}
