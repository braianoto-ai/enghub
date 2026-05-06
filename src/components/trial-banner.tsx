"use client";

import Link from "next/link";
import { Zap, X } from "lucide-react";
import { useState } from "react";

interface TrialBannerProps {
  trialEndsAt: string; // ISO date string
  plan: string;
}

export function TrialBanner({ trialEndsAt, plan }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || plan !== "PRO") return null;

  const endsAt = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Só mostra se ainda está no trial (trial_ends_at no futuro)
  if (endsAt <= now) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`mb-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 ${
        isUrgent
          ? "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20"
          : "border-gray-300 bg-gray-100 dark:border-gray-700/50 dark:bg-gray-800/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUrgent ? "bg-amber-100 dark:bg-amber-900/40" : "bg-gray-200 dark:bg-gray-700/40"
          }`}
        >
          <Zap
            size={16}
            className={isUrgent ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-gray-400"}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${
              isUrgent ? "text-amber-800 dark:text-amber-300" : "text-gray-800 dark:text-gray-300"
            }`}
          >
            {isUrgent
              ? `⚠️ Seu trial expira em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}!`
              : `🎉 Você está no trial PRO — ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
          </p>
          <p
            className={`text-xs ${
              isUrgent ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-gray-400"
            }`}
          >
            {isUrgent
              ? "Assine o Pro para não perder seus recursos — projetos ilimitados, destaque nas buscas e mais."
              : "Aproveite todos os recursos PRO gratuitamente. Assine antes de expirar para não perder nada."}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link href="/dashboard/plano">
          <button
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
              isUrgent ? "bg-amber-500 hover:bg-amber-400" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isUrgent ? "Assinar agora" : "Ver planos"}
          </button>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`rounded-lg p-1.5 transition ${
            isUrgent
              ? "text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/40"
          }`}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
