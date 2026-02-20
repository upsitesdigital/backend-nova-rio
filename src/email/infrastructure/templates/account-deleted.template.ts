import { baseLayout } from './base-layout.js';

export function accountDeletedTemplate(name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Conta excluída
    </h1>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Olá <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Confirmamos que sua conta na Nova Rio foi <strong>excluída com sucesso</strong>. Todos os seus dados pessoais foram removidos da nossa plataforma.
    </p>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Lamentamos vê-lo partir. Caso deseje voltar, será necessário criar uma nova conta.
    </p>
    <!-- Contact box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#f0faf6;border-left:4px solid #008053;border-radius:0 8px 8px 0;padding:20px 24px;">
          <p style="margin:0 0 8px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#008053;">
            Precisa de ajuda?
          </p>
          <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#333333;line-height:1.6;">
            Se você não solicitou a exclusão da conta, entre em contato com nosso suporte imediatamente.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#888888;line-height:1.5;">
      Obrigado por ter sido parte da Nova Rio. Esperamos poder atendê-lo novamente no futuro.
    </p>
  `);
}
