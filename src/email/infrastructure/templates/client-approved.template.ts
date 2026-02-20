import { baseLayout } from './base-layout.js';

export function clientApprovedTemplate(name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Cadastro aprovado!
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Temos uma ótima notícia: <strong style="color:#008053;">seu cadastro foi aprovado!</strong>
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Agora você tem acesso completo à plataforma Nova Rio e pode agendar serviços de limpeza para sua empresa sempre que precisar.
    </p>
    <!-- Success box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#f0faf6;border-radius:12px;padding:24px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="font-size:40px;line-height:1;">&#x2705;</td>
            </tr>
            <tr>
              <td style="padding-top:12px;font-family:'Work Sans',Arial,sans-serif;font-size:18px;font-weight:600;color:#008053;">
                Conta ativa
              </td>
            </tr>
            <tr>
              <td style="padding-top:8px;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#555555;line-height:1.5;">
                Faça login no app para explorar nossos serviços.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- Features -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="border-left:4px solid #008053;border-radius:0 8px 8px 0;padding:16px 24px;background-color:#fafafa;">
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#008053;">
            O que você pode fazer agora:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;">
                &#x2714; Agendar serviços de limpeza
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;">
                &#x2714; Escolher pacotes sob demanda
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;">
                &#x2714; Gerenciar pagamentos com facilidade
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Estamos à disposição para ajudá-lo no que precisar.
    </p>
  `);
}
