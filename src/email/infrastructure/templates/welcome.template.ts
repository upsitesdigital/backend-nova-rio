import { baseLayout } from './base-layout.js';

export function welcomeTemplate(name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Bem-vindo à Nova Rio!
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Sua conta foi criada com sucesso! Estamos felizes em ter você conosco.
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Nosso time irá analisar seu cadastro e em breve você receberá a aprovação para acessar todos os nossos serviços de limpeza empresarial.
    </p>
    <!-- Info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#f0faf6;border-left:4px solid #008053;border-radius:0 8px 8px 0;padding:20px 24px;">
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#008053;">
            Enquanto isso, saiba o que oferecemos:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;line-height:1.5;">
                &#x2714; Agendamento rápido e flexível
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;line-height:1.5;">
                &#x2714; Profissionais qualificados e uniformizados
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;line-height:1.5;">
                &#x2714; Pagamento simplificado, sem burocracia
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Se você não criou esta conta, por favor ignore este e-mail.
    </p>
  `);
}
