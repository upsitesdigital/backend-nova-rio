import { baseLayout } from './base-layout.js';

export function passwordChangedTemplate(name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Senha alterada com sucesso
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Sua senha foi alterada com sucesso. Você já pode usar a nova senha para acessar sua conta.
    </p>
    <!-- Warning box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#fff8f0;border-left:4px solid #e8a23e;border-radius:0 8px 8px 0;padding:16px 24px;">
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#8a6d3b;line-height:1.5;">
            <strong>Não foi você?</strong> Se você não realizou essa alteração, entre em contato com nosso suporte imediatamente.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Este é um e-mail automático de segurança. Nenhuma ação é necessária caso você tenha feito a alteração.
    </p>
  `);
}
