import { Resend } from "resend";

// Domínio do site e remetente — controlados por variável de ambiente.
// Quando o domínio próprio (ex.: enghub.com.br) for conectado, basta
// atualizar NEXT_PUBLIC_SITE_URL e EMAIL_FROM, sem mexer no código.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub.com.br";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "EngHub <onboarding@resend.dev>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

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
  void slug;
  return getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Nova mensagem de ${senderName} — EngHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #4b5563, #374151); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Nova mensagem recebida</h1>
          <p style="color: #d1d5db; margin: 8px 0 0; font-size: 14px;">Via EngHub — portfólio de ${professionalName}</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Nome</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">E-mail</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${senderEmail}" style="color: #4b5563;">${senderEmail}</a></td>
            </tr>
            ${senderPhone ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Telefone</td><td style="padding: 8px 0; font-size: 14px;">${senderPhone}</td></tr>` : ""}
          </table>
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="text-align: center;">
            <a href="${SITE_URL}/dashboard/mensagens" style="display: inline-block; background: #4b5563; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Ver no Dashboard
            </a>
          </div>
          <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
            Para responder, envie um e-mail para <a href="mailto:${senderEmail}" style="color: #4b5563;">${senderEmail}</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendTrialReminderEmail({
  to,
  name,
  trialEndsAt,
}: {
  to: string;
  name: string;
  trialEndsAt: string;
}) {
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const formattedDate = new Date(trialEndsAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Seu período PRO termina em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} — EngHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; background: #f9fafb; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 40px 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 12px;">⏳</div>
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">Seu trial PRO está acabando</h1>
          <p style="color: #fde68a; margin: 10px 0 0; font-size: 15px;">Expira em <strong>${daysLeft} dia${daysLeft !== 1 ? "s" : ""}</strong> — ${formattedDate}</p>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; margin-bottom: 20px;">
          <p style="margin: 0 0 16px; font-size: 15px; color: #374151; line-height: 1.6;">
            Olá, <strong>${name.split(" ")[0]}</strong>! Seu período de teste PRO no EngHub está prestes a terminar.
          </p>
          <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
            Para continuar aproveitando todos os benefícios, assine o plano PRO antes do dia ${formattedDate}.
          </p>
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #92400e;">O que você perde sem o PRO:</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${["Perfil em destaque nas buscas", "Analytics completo de visitas", "Upload de currículo em PDF", "Badge PRO no perfil público", "Suporte prioritário"]
                .map(item => `<tr><td style="padding: 5px 0; font-size: 13px; color: #b45309; width: 20px;">✗</td><td style="padding: 5px 0; font-size: 13px; color: #374151;">${item}</td></tr>`)
                .join("")}
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${SITE_URL}/dashboard/plano" style="display: inline-block; background: #d97706; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700;">
              Assinar o Plano PRO →
            </a>
          </div>
          <p style="text-align: center; margin-top: 16px; font-size: 13px; color: #9ca3af;">
            A partir de R$ 29/mês. Cancele quando quiser.
          </p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 0;">
          Você recebeu este e-mail pois tem uma conta no EngHub.<br/>
          <a href="${SITE_URL}" style="color: #4b5563; text-decoration: none;">EngHub</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  slug,
  hasTrial,
}: {
  to: string;
  name: string;
  slug: string;
  hasTrial: boolean;
}) {
  const profileUrl = `${SITE_URL}/${slug}`;
  const dashboardUrl = `${SITE_URL}/dashboard`;

  return getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Bem-vindo ao EngHub, ${name.split(" ")[0]}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; background: #f9fafb; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #4b5563, #374151); padding: 40px 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 10px; margin-bottom: 16px;">
            <span style="font-size: 22px; font-weight: 900; color: #fff;">E</span>
          </div>
          <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 800;">Seja bem-vindo, ${name.split(" ")[0]}!</h1>
          <p style="color: #d1d5db; margin: 10px 0 0; font-size: 15px;">Seu perfil profissional no EngHub está pronto.</p>
        </div>
        ${hasTrial ? `
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #92400e;">🎁 14 dias de PRO grátis ativados!</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #b45309;">Aproveite todos os recursos premium durante seu período de teste.</p>
        </div>
        ` : ""}
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 20px; font-size: 16px; font-weight: 700; color: #111;">Próximos passos ✅</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${[
              ["Complete seu perfil", "Adicione sua bio, foto, cidade e WhatsApp."],
              ["Adicione seus projetos", "Mostre seu trabalho com fotos e descrições."],
              ["Cadastre seus serviços", "Deixe claro o que você oferece e o preço."],
              ["Compartilhe seu perfil", "Envie para clientes, redes sociais e WhatsApp."],
            ].map(([title, desc], i) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; width: 36px;">
                <div style="width: 28px; height: 28px; background: #f3f4f6; border-radius: 50%; text-align: center; font-size: 13px; font-weight: 700; color: #374151; line-height: 28px;">${i + 1}</div>
              </td>
              <td style="padding: 10px 0 10px 12px; border-bottom: 1px solid #f3f4f6;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111;">${title}</p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">${desc}</p>
              </td>
            </tr>`).join("")}
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #4b5563; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700; margin-bottom: 12px;">
            Acessar o Dashboard →
          </a><br/>
          <a href="${profileUrl}" style="display: inline-block; color: #4b5563; padding: 8px 16px; font-size: 13px; text-decoration: underline;">
            Ver meu perfil público
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 0;">
          Você recebeu este e-mail por se cadastrar no EngHub.<br/>
          <a href="${SITE_URL}" style="color: #4b5563; text-decoration: none;">EngHub</a>
        </p>
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
  void slug;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const labels = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

  return getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Nova avaliação ${stars} de ${reviewerName} — EngHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #4b5563, #374151); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Nova avaliação recebida</h1>
          <p style="color: #d1d5db; margin: 8px 0 0; font-size: 14px;">Via EngHub — portfólio de ${professionalName}</p>
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
            <a href="${SITE_URL}/dashboard/avaliacoes" style="display: inline-block; background: #4b5563; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Ver Avaliações
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
