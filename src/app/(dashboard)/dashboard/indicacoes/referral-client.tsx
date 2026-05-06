"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Zap,
  Share2,
  ExternalLink,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub.com.br";

interface Referral {
  id: string;
  referred_name: string;
  referred_email: string;
  rewarded: boolean;
  created_at: string;
}

interface ReferralClientProps {
  tenantSlug: string;
  referralCode: string;
  referrals: Referral[];
  rewardedCount: number;
}

export function ReferralClient({
  tenantSlug,
  referralCode,
  referrals,
  rewardedCount,
}: ReferralClientProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${SITE_URL}/cadastro?ref=${referralCode}`;

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappText = encodeURIComponent(
    `Ei! Estou usando o EngHub para divulgar meu portfólio de engenharia. Se você se cadastrar pelo meu link, ganha 30 dias do plano PRO grátis! 🎁\n\n${referralUrl}`
  );

  return (
    <div className="mt-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: Users,
            label: "Total de indicados",
            value: referrals.length,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30",
          },
          {
            icon: Check,
            label: "Indicações confirmadas",
            value: rewardedCount,
            color: "bg-green-50 text-green-600 dark:bg-green-900/30",
          },
          {
            icon: Zap,
            label: "Dias de PRO ganhos",
            value: `${rewardedCount * 30}`,
            color: "bg-violet-50 text-violet-600 dark:bg-violet-900/30",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Como funciona */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Como funciona
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Compartilhe seu link",
              desc: "Envie seu link exclusivo para colegas engenheiros.",
            },
            {
              step: "2",
              title: "Eles se cadastram",
              desc: "Quando se cadastram pelo seu link, ganham +30 dias de PRO.",
            },
            {
              step: "3",
              title: "Você ganha também",
              desc: "Você recebe +30 dias de PRO para cada indicação confirmada.",
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link de indicação */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800/50 dark:bg-violet-900/20">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-violet-600 dark:text-violet-400" />
          <h2 className="font-semibold text-violet-900 dark:text-violet-300">
            Seu link de indicação
          </h2>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-xl border border-violet-200 bg-white px-4 py-3 dark:border-violet-700/50 dark:bg-zinc-900">
            <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300 font-mono">
              {referralUrl}
            </span>
          </div>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500"
          >
            <Share2 size={15} />
            Compartilhar no WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <ExternalLink size={15} />
            Compartilhar no LinkedIn
          </a>
        </div>
      </div>

      {/* Lista de indicados */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Histórico de indicações
          </h2>
        </div>

        {referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-400">
            <Users size={32} className="opacity-30" />
            <p className="text-sm">Nenhuma indicação ainda.</p>
            <p className="text-xs">Compartilhe seu link para começar!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {r.referred_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {r.referred_name || "Sem nome"}
                    </p>
                    <p className="text-xs text-zinc-500">{r.referred_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.rewarded
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {r.rewarded ? "+30 dias concedidos" : "Pendente"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
