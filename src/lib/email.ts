import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactNotification({
  to,
  professionalName,
  senderName,
  senderEmail,
  senderPhone,
  message,
  slug,
}: {
  to: string;
  professionalName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  slug: string;
}) {
  return resend.emails.send({
    from: "EngHub <notificacoes@enghub.com.br>",
    to,
    subject: `Nova mensagem de ${senderName} — EngHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #2563eb, #4338ca); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Nova mensagem recebida</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Via EngHub — portfólio de ${professionalName}</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Nome</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">E-mail</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${senderEmail}" style="color: #2563eb;">${senderEmail}</a></td>
            </tr>
            ${senderPhone ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Telefone</td><td style="padding: 8px 0; font-size: 14px;">${senderPhone}</td></tr>` : ""}
          </table>
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="text-align: center;">
            <a href="https://enghub.com.br/dashboard/mensagens" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Ver no Dashboard
            </a>
          </div>
          <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
            Para responder, envie um e-mail para <a href="mailto:${senderEmail}" style="color: #2563eb;">${senderEmail}</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendReviewNotification({
  to,
  professionalName,
  reviewerName,
  rating,
  comment,
  slug,
}: {
  to: string;
  professionalName: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  slug: string;
}) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const labels = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

  return resend.emails.send({
    from: "EngHub <notificacoes@enghub.com.br>",
    to,
    subject: `Nova avaliação ${stars} de ${reviewerName} — EngHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #2563eb, #4338ca); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Nova avaliação recebida</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Via EngHub — portfólio de ${professionalName}</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="font-size: 40px; margin: 0; letter-spacing: 4px; color: #f59e0b;">${stars}</p>
            <p style="font-size: 20px; font-weight: 700; margin: 8px 0 0; color: #111;">${rating}/5 — ${labels[rating]}</p>
            <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">por ${reviewerName}</p>
          </div>
          ${comment ? `
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; font-style: italic;">"${comment}"</p>
          </div>
          ` : ""}
          <div style="text-align: center;">
            <a href="https://enghub.com.br/dashboard/avaliacoes" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Ver Avaliações
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
