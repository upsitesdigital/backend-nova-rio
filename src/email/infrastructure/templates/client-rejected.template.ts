import { baseLayout } from './base-layout.js';

export function clientRejectedTemplate(name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Atualização do seu cadastro
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Agradecemos seu interesse na Nova Rio. Após a análise, infelizmente <strong>não foi possível aprovar seu cadastro</strong> neste momento.
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Isso pode ter ocorrido por informações incompletas ou critérios de elegibilidade. Fique tranquilo — você pode entrar em contato conosco para mais detalhes.
    </p>
    <!-- Contact box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#f0faf6;border-left:4px solid #008053;border-radius:0 8px 8px 0;padding:20px 24px;">
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#008053;">
            Precisa de ajuda?
          </p>
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;line-height:1.6;">
            Entre em contato com nosso suporte e teremos prazer em ajudá-lo a resolver qualquer pendência.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Obrigado pela compreensão. Esperamos poder atendê-lo em breve.
    </p>
  `);
}
