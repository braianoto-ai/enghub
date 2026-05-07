import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | EngHub",
};

const sections = [
  {
    title: "1. Dados Coletados",
    content:
      "Coletamos informações fornecidas no cadastro (nome, e-mail, área de atuação, registro profissional), dados de uso da plataforma (páginas visitadas, buscas realizadas) e informações técnicas (endereço IP, navegador, dispositivo).",
  },
  {
    title: "2. Finalidade do Uso",
    content:
      "Utilizamos seus dados para: operar e manter a plataforma, personalizar sua experiência, exibir seu perfil profissional nas buscas, enviar notificações relevantes, processar pagamentos e melhorar nossos serviços.",
  },
  {
    title: "3. Compartilhamento de Dados",
    content:
      "Seu perfil profissional (nome, área, portfólio) é público e visível para outros usuários. Não vendemos seus dados pessoais. Podemos compartilhar informações com prestadores de serviço (processamento de pagamento, envio de e-mails) sob contratos de confidencialidade.",
  },
  {
    title: "4. Armazenamento e Segurança",
    content:
      "Seus dados são armazenados em servidores seguros com criptografia. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou alteração.",
  },
  {
    title: "5. Cookies",
    content:
      "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para entender como os usuários utilizam o serviço. Você pode gerenciar suas preferências de cookies nas configurações do navegador.",
  },
  {
    title: "6. Seus Direitos (LGPD)",
    content:
      "Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar a exclusão de dados, revogar consentimento e solicitar a portabilidade dos dados. Para exercer esses direitos, entre em contato conosco.",
  },
  {
    title: "7. Retenção de Dados",
    content:
      "Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados pessoais serão removidos em até 30 dias, exceto quando necessário para cumprimento de obrigações legais.",
  },
  {
    title: "8. Alterações nesta Política",
    content:
      "Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por e-mail ou notificação na plataforma.",
  },
  {
    title: "9. Contato",
    content:
      "Para questões sobre privacidade, entre em contato pelo e-mail privacidade@enghub.com.br.",
  },
];

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Última atualização: maio de 2026
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {s.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {s.content}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
