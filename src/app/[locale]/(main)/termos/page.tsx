import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | EngHub",
};

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content:
      "Ao acessar e utilizar a plataforma EngHub, você concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize a plataforma.",
  },
  {
    title: "2. Descrição do Serviço",
    content:
      "O EngHub é uma plataforma que conecta engenheiros e profissionais da construção civil a clientes. Oferecemos ferramentas de portfólio, busca de profissionais, avaliações e comunicação entre as partes.",
  },
  {
    title: "3. Cadastro e Conta",
    content:
      "Para utilizar determinados recursos, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.",
  },
  {
    title: "4. Uso Aceitável",
    content:
      "Você concorda em não utilizar a plataforma para fins ilegais, fraudulentos, difamatórios ou que violem direitos de terceiros. É proibido publicar informações falsas sobre qualificações profissionais, registros (CREA/CAU) ou experiência.",
  },
  {
    title: "5. Propriedade Intelectual",
    content:
      "Todo o conteúdo da plataforma (marca, design, código) é propriedade do EngHub. O conteúdo publicado pelos usuários (textos, imagens de projetos) permanece de propriedade do autor, que concede ao EngHub licença para exibição na plataforma.",
  },
  {
    title: "6. Planos e Pagamentos",
    content:
      "O EngHub oferece planos gratuitos e pagos. Os valores e benefícios de cada plano estão descritos na página de preços. Assinaturas são renovadas automaticamente e podem ser canceladas a qualquer momento.",
  },
  {
    title: "7. Limitação de Responsabilidade",
    content:
      "O EngHub não se responsabiliza por negociações, contratos ou serviços realizados entre profissionais e clientes fora da plataforma. Não garantimos a qualidade, segurança ou legalidade dos serviços oferecidos pelos profissionais cadastrados.",
  },
  {
    title: "8. Modificações",
    content:
      "Reservamo-nos o direito de alterar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.",
  },
  {
    title: "9. Contato",
    content:
      "Para dúvidas sobre estes Termos, entre em contato pelo e-mail contato@enghub.com.br.",
  },
];

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Termos de Uso
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
