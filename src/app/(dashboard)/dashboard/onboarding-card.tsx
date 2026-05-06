"use client";

import Link from "next/link";
import { Check, ChevronRight, Rocket, X } from "lucide-react";
import { useState } from "react";

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  href: string;
  done: boolean;
}

interface OnboardingCardProps {
  steps: OnboardingStep[];
  slug: string;
}

export function OnboardingCard({ steps, slug }: OnboardingCardProps) {
  const [dismissed, setDismissed] = useState(false);

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  if (dismissed) return null;

  if (allDone) {
    return (
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-6 py-4 dark:border-green-800/50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
            <Rocket size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">
              Perfil completo! 🎉
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Seu perfil está pronto para receber clientes.{" "}
              <Link
                href={`/${slug}`}
                target="_blank"
                className="underline underline-offset-2"
              >
                Ver perfil público →
              </Link>
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-800/40"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
            <Rocket size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              Complete seu perfil
            </p>
            <p className="text-sm text-zinc-500">
              {doneCount} de {total} passos concluídos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-violet-600">{pct}%</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-1.5 bg-violet-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {steps.map((step, i) => (
          <Link
            key={step.id}
            href={step.done ? "#" : step.href}
            className={`flex items-center gap-4 px-6 py-4 transition-colors ${
              step.done
                ? "cursor-default"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            {/* Indicador */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step.done
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
              }`}
            >
              {step.done ? (
                <Check size={15} className="text-green-600 dark:text-green-400" />
              ) : (
                <span className="text-zinc-400 dark:text-zinc-500">{i + 1}</span>
              )}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.done
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {step.label}
              </p>
              {!step.done && (
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {step.description}
                </p>
              )}
            </div>

            {/* Ação */}
            {!step.done && (
              <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-violet-600">
                Fazer agora
                <ChevronRight size={14} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
