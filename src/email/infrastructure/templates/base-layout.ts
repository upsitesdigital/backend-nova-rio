import { readFileSync } from 'fs';
import { join } from 'path';

const logoSvg = readFileSync(join(process.cwd(), 'assets/logo.svg'), 'utf-8');
const logoBase64 = Buffer.from(logoSvg).toString('base64');

export function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Work Sans',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 40px;text-align:center;">
              <img src="data:image/svg+xml;base64,${logoBase64}" alt="Nova Rio" width="140" height="75" style="display:block;margin:0 auto;" />
            </td>
          </tr>
          <!-- Green accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#008053,#00A77E);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:24px 40px;border-top:1px solid #e8e8e8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-family:'Work Sans',Arial,sans-serif;font-size:13px;color:#888888;line-height:1.6;">
                    <p style="margin:0 0 4px 0;font-weight:500;color:#008053;">Nova Rio Pay Per Use</p>
                    <p style="margin:0;">Limpeza empresarial sob demanda no padrão que sua empresa merece.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
