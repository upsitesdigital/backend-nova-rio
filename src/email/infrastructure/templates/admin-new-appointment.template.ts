import { baseLayout } from './base-layout.js';

export function adminNewAppointmentTemplate(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
): string {
  return baseLayout(`
    <h1 style="margin:0 0 24px 0;font-family:'Work Sans',Arial,sans-serif;font-size:24px;font-weight:600;color:#0a0a0a;line-height:1.3;">
      Novo agendamento criado
    </h1>
    <p style="margin:0 0 32px 0;font-family:'Work Sans',Arial,sans-serif;font-size:16px;color:#333333;line-height:1.6;">
      Um novo agendamento foi confirmado na plataforma:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#0a0a0a;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 12px 0;font-family:'Work Sans',Arial,sans-serif;font-size:13px;font-weight:500;color:#00A77E;text-transform:uppercase;letter-spacing:2px;">
            Detalhes do agendamento
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
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;">Data</td>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;">${date}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;color:#aaaaaa;">Horário</td>
              <td style="padding:6px 0;font-family:'Work Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;">${time}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);
}
