import { baseLayout } from './base-layout.js';

export function paymentApprovedTemplate(
  name: string,
  amount: string,
  serviceName: string,
  date: string,
): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Pagamento confirmado!
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Seu pagamento foi <strong style="color:#008053;">aprovado com sucesso</strong>. Confira os detalhes:
    </p>
    <!-- Receipt box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#f0faf6;border-radius:12px;padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#555555;">
                <strong style="color:#008053;">Serviço:</strong> ${serviceName}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#555555;">
                <strong style="color:#008053;">Data:</strong> ${date}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-top:1px solid #d4edda;padding-top:16px;font-family:'Work Sans',Arial,sans-serif;font-size:20px;font-weight:600;color:#008053;">
                Valor: R$ ${amount}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      O comprovante de pagamento está disponível no app. Obrigado por utilizar a Nova Rio!
    </p>
  `);
}
