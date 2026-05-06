import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  Heart,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre o EngHub",
  description:
    "Conheça a história, missão e os valores do EngHub — a plataforma que conecta engenheiros e clientes no Brasil.",
};

const stats = [
  { value: "500+", label: "Engenheiros cadastrados" },
  { value: "12+", label: "Áreas de atuação" },
  { value: "4.8", label: "Nota média dos perfis" },
  { value: "2024", label: "Ano de fundação" },
];

const values = [
  {
    icon: Shield,
    title: "Confiança",
    description:
      "Perfis verificados com CREA/CAU, avaliações reais de clientes e transparência em cada conexão.",
  },
  {
    icon: Zap,
    title: "Tecnologia",
    description:
      "Ferramentas modernas para que engenheiros se destaquem e clientes encontrem o profissional certo com facilidade.",
  },
  {
    icon: Heart,
    title: "Comunidade",
    description:
      "Mais do que uma plataforma — um ecossistema que valoriza e impulsiona a carreira dos profissionais de engenharia.",
  },
  {
    icon: Target,
    title: "Resultado",
    description:
      "Focamos no sucesso real: mais contratos para o profissional, projetos melhores executados para o cliente.",
  },
];

const team = [
  {
    name: "Braian Otovicz",
    role: "Co-fundador & CEO",
    initials: "BO",
    color: "from-gray-500 to-gray-700",
  },
  {
    name: "Gabriel",
    role: "Co-fundador & CTO",
    initials: "GA",
    color: "from-gray-500 to-gray-700",
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-28 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gray-700/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-gray-1000/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-1000/10 px-4 py-1.5 text-sm text-gray-400">
            <Heart size={13} />
            Feito com propósito
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
            Conectando engenharia e oportunidade
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            O EngHub nasceu da frustração de ver engenheiros talentosos sem
            visibilidade e clientes sem saber onde encontrar o profissional certo.
            Decidimos resolver isso.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 divide-x divide-zinc-100 lg:grid-cols-4 dark:divide-zinc-800">
            {stats.map((s) => (
              <div key={s.label} className="px-8 py-10 text-center">
                <p className="text-4xl font-bold text-gray-700">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nossa história */}
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-700">
              Nossa história
            </p>
            <h2 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              De uma problema real para uma solução concreta
            </h2>
            <div className="mt-6 space-y-4 text-zinc-600 dark:text-zinc-400">
              <p className="leading-relaxed">
                Em 2024, percebemos que o mercado de engenharia no Brasil tinha
                um gap enorme: profissionais qualificados perdiam tempo divulgando
                seus serviços em grupos de WhatsApp e planilhas, enquanto clientes
                não tinham onde comparar portfólios, ver avaliações reais e
                contratar com confiança.
              </p>
              <p className="leading-relaxed">
                O EngHub surgiu para preencher esse espaço. Uma plataforma pensada
                do zero para engenheiros — com portfólio profissional, gestão de
                serviços, avaliações verificadas e ferramentas de visibilidade que
                realmente funcionam.
              </p>
              <p className="leading-relaxed">
                Hoje, mais de 500 profissionais de todo o Brasil já têm sua
                presença digital no EngHub, e esse número cresce a cada semana.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              {[
                "Perfis com portfólio completo de projetos",
                "Avaliações verificadas de clientes reais",
                "Visibilidade nas buscas por área e localização",
                "Ferramentas de gestão de serviços e mensagens",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle size={18} className="shrink-0 text-gray-700" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-800 p-8">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                  <span className="font-bold text-white text-sm">E</span>
                </div>
                <span className="font-bold text-white">EngHub</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Engenheiro Civil", area: "Civil", pct: 85 },
                  { label: "Engenheiro Elétrico", area: "Elétrica", pct: 72 },
                  { label: "Arquiteta", area: "Arquitetura", pct: 91 },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{p.label}</p>
                        <p className="text-xs text-zinc-400">{p.area}</p>
                      </div>
                      <div className="flex">
                        {"★★★★★".split("").map((s, i) => (
                          <span key={i} className="text-amber-400 text-sm">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-gray-1000"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-zinc-500">{p.pct}% perfil completo</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-700">
              O que nos guia
            </p>
            <h2 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Nossos valores
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/30">
                    <Icon size={22} className="text-gray-700" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-700">
            Quem faz acontecer
          </p>
          <h2 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Nosso time
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Um time pequeno e focado em construir o melhor produto possível para engenheiros.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${member.color} text-xl font-bold text-white shadow-lg`}
              >
                {member.initials}
              </div>
              <p className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
                {member.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900/40 to-zinc-950 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Faça parte dessa história
          </h2>
          <p className="mt-3 text-zinc-400">
            Crie seu perfil gratuito e mostre seu trabalho para milhares de clientes em potencial.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro">
              <button className="flex items-center gap-2 rounded-xl bg-gray-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-500/25 transition hover:bg-gray-600">
                Criar perfil grátis
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/blog">
              <button className="rounded-xl border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                Ler nosso blog
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
