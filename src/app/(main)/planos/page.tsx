"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Zap,
  Building2,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
  Headphones,
  BarChart3,
  Globe,
} from "lucide-react";

const plans = [
  {
    key: "FREE",
    name: "Gratuito",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Para quem está começando e quer mostrar o trabalho",
    badge: null,
    icon: Shield,
    iconColor: "text-zinc-500",
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    features: [
      "1 perfil profissional",
      "Até 5 projetos no portfólio",
      "Até 3 serviços cadastrados",
      "Página pública básica",
      "Aparecer nas buscas",
      "Receber avaliações",
      null,
      null,
      null,
    ],
    cta: "Começar grátis",
    ctaLink: "/cadastro",
    highlighted: false,
  },
  {
    key: "PRO",
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Para profissionais que querem se destacar e crescer",
    badge: "Mais popular",
    icon: Zap,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    features: [
      "Projetos ilimitados",
      "Serviços ilimitados",
      "Subdomínio personalizado",
      "Destaque nas buscas",
      "Selo de verificado",
      "Estatísticas de visitas",
      "Suporte prioritário",
      null,
      null,
    ],
    cta: "Assinar Pro",
    ctaLink: "/cadastro",
    highlighted: true,
  },
  {
    key: "EMPRESA",
    name: "Empresa",
    monthlyPrice: 129,
    yearlyPrice: 99,
    description: "Para escritórios e empresas de engenharia",
    badge: null,
    icon: Building2,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    features: [
      "Tudo do Pro",
      "Até 10 membros na equipe",
      "Página da empresa",
      "Domínio próprio",
      "Relatórios avançados",
      "API de integração",
      "Suporte por WhatsApp",
      null,
      null,
    ],
    cta: "Assinar Empresa",
    ctaLink: "/cadastro",
    highlighted: false,
  },
  {
    key: "PREMIUM",
    name: "Premium",
    monthlyPrice: 299,
    yearlyPrice: 239,
    description: "Solução completa para grandes operações",
    badge: null,
    icon: Star,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    features: [
      "Tudo do Empresa",
      "Membros ilimitados",
      "Templates de documentos técnicos",
      "Integração com CREA",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Onboarding personalizado",
      "Treinamento da equipe",
      "Acesso antecipado a novidades",
    ],
    cta: "Falar com vendas",
    ctaLink: "mailto:contato@enghub.com.br",
    highlighted: false,
  },
];

const comparisonFeatures = [
  {
    category: "Portfólio",
    rows: [
      { label: "Projetos no portfólio", values: ["Até 5", "Ilimitados", "Ilimitados", "Ilimitados"] },
      { label: "Serviços cadastrados", values: ["Até 3", "Ilimitados", "Ilimitados", "Ilimitados"] },
      { label: "Galeria de imagens", values: [true, true, true, true] },
      { label: "Vídeos nos projetos", values: [false, true, true, true] },
    ],
  },
  {
    category: "Visibilidade",
    rows: [
      { label: "Página pública", values: [true, true, true, true] },
      { label: "Aparecer nas buscas", values: [true, true, true, true] },
      { label: "Destaque nas buscas", values: [false, true, true, true] },
      { label: "Selo de verificado", values: [false, true, true, true] },
      { label: "Subdomínio personalizado", values: [false, true, true, true] },
      { label: "Domínio próprio", values: [false, false, true, true] },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { label: "Estatísticas de visitas", values: [false, true, true, true] },
      { label: "Relatórios avançados", values: [false, false, true, true] },
      { label: "Exportação de dados", values: [false, false, true, true] },
    ],
  },
  {
    category: "Equipe",
    rows: [
      { label: "Membros na equipe", values: ["—", "—", "Até 10", "Ilimitados"] },
      { label: "Página da empresa", values: [false, false, true, true] },
      { label: "Gestão de permissões", values: [false, false, true, true] },
    ],
  },
  {
    category: "Suporte",
    rows: [
      { label: "Suporte por e-mail", values: [true, true, true, true] },
      { label: "Suporte prioritário", values: [false, true, true, true] },
      { label: "Suporte por WhatsApp", values: [false, false, true, true] },
      { label: "Gerente de conta dedicado", values: [false, false, false, true] },
    ],
  },
];

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim. Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento pelo painel e continuará com acesso até o fim do período pago.",
  },
  {
    question: "O que acontece com meu perfil se eu cancelar?",
    answer: "Seu perfil fica ativo no plano Gratuito. Você mantém até 5 projetos e 3 serviços. Projetos excedentes ficam ocultos temporariamente.",
  },
  {
    question: "Existe período de teste gratuito?",
    answer: "Sim! Todo novo cadastro recebe 14 dias do plano Pro gratuitamente, sem precisar de cartão de crédito. Explore todos os recursos e decida depois.",
  },
  {
    question: "Como funciona o desconto anual?",
    answer: "Ao escolher o plano anual, você paga 12 meses com desconto de até 20%, economizando meses de assinatura comparado ao mensal.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim, você pode fazer upgrade ou downgrade quando quiser. Upgrades têm efeito imediato com cobrança proporcional. Downgrades valem no próximo ciclo.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos todos os cartões de crédito e débito das bandeiras Visa, Mastercard, Elo e American Express. O pagamento é processado pelo Stripe com segurança máxima.",
  },
];

export default function PlanosPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
            <Zap size={14} />
            14 dias de Pro grátis para novos cadastros
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
            Planos que crescem com você
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Comece grátis e faça upgrade conforme sua carreira avança.
            Sem fidelidade, sem surpresas.
          </p>

          {/* Toggle anual/mensal */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-800/60 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !annual
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                annual
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Anual
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
                −20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de planos */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  plan.highlighted
                    ? "border-violet-500 bg-violet-600 text-white shadow-xl shadow-violet-500/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet-900 px-4 py-1 text-xs font-semibold text-violet-200 ring-1 ring-violet-500">
                    {plan.badge}
                  </div>
                )}

                <div className={`w-fit rounded-xl p-2 ${plan.highlighted ? "bg-white/20" : plan.iconBg}`}>
                  <Icon size={20} className={plan.highlighted ? "text-white" : plan.iconColor} />
                </div>

                <div className="mt-4">
                  <h3 className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${plan.highlighted ? "text-violet-200" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  {price === 0 ? (
                    <div className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                      Grátis
                    </div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className={`text-sm ${plan.highlighted ? "text-violet-200" : "text-zinc-500"}`}>R$</span>
                      <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {price}
                      </span>
                      <span className={`mb-1 text-sm ${plan.highlighted ? "text-violet-200" : "text-zinc-500"}`}>
                        /mês
                      </span>
                    </div>
                  )}
                  {annual && price > 0 && (
                    <p className={`mt-1 text-xs ${plan.highlighted ? "text-violet-200" : "text-zinc-400"}`}>
                      Cobrado anualmente · R$ {price * 12}/ano
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.filter(Boolean).map((feature) => (
                    <li key={feature as string} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-violet-200" : "text-green-500"}`}
                      />
                      <span className={`text-sm ${plan.highlighted ? "text-violet-100" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="mt-8 block">
                  <button
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-white text-violet-700 hover:bg-violet-50"
                        : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Prova social */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-zinc-100 pt-12 dark:border-zinc-800">
          {[
            { icon: Shield, text: "Pagamento 100% seguro via Stripe" },
            { icon: Zap, text: "Ativação imediata após pagamento" },
            { icon: Headphones, text: "Suporte em português" },
            { icon: Users, text: "+500 engenheiros na plataforma" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Icon size={16} className="text-violet-500" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Compare os planos
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Veja em detalhes o que está incluso em cada plano
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-4 pl-6 pr-4 text-left text-sm font-medium text-zinc-500">
                    Recursos
                  </th>
                  {plans.map((p) => (
                    <th key={p.key} className="px-4 py-4 text-center">
                      <span className={`text-sm font-bold ${p.highlighted ? "text-violet-600" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {p.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures
                  .slice(0, showFullTable ? undefined : 2)
                  .map((category) => (
                    <>
                      <tr key={category.category} className="bg-zinc-50 dark:bg-zinc-800/50">
                        <td
                          colSpan={5}
                          className="py-2 pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-400"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {category.rows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                        >
                          <td className="py-3 pl-6 pr-4 text-sm text-zinc-700 dark:text-zinc-300">
                            {row.label}
                          </td>
                          {row.values.map((val, i) => (
                            <td key={i} className="px-4 py-3 text-center">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <Check size={16} className="mx-auto text-green-500" />
                                ) : (
                                  <X size={16} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                                )
                              ) : (
                                <span className={`text-sm font-medium ${val === "—" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                                  {val}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
              </tbody>
            </table>

            {!showFullTable && (
              <div className="border-t border-zinc-100 p-4 text-center dark:border-zinc-800">
                <button
                  onClick={() => setShowFullTable(true)}
                  className="flex items-center gap-1 mx-auto text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  Ver comparação completa
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Perguntas frequentes
          </h2>
        </div>

        <div className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown size={18} className="shrink-0 text-zinc-400" />
                )}
              </button>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div className="px-4 pb-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-violet-950/40 to-zinc-950 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Pronto para se destacar?
          </h2>
          <p className="mt-3 text-zinc-400">
            Crie seu perfil agora e receba 14 dias do plano Pro completamente grátis.
            Sem cartão de crédito necessário.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro">
              <button className="rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500">
                Criar perfil grátis
              </button>
            </Link>
            <Link href="/buscar">
              <button className="rounded-xl border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                Ver profissionais
              </button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Globe size={13} />
            Mais de 500 engenheiros já têm seu perfil no EngHub
          </div>
        </div>
      </div>
    </div>
  );
}
