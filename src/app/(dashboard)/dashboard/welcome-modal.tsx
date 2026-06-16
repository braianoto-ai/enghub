"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Rocket, X, UserCircle, FolderOpen, Briefcase, CheckCircle2 } from "lucide-react";

interface WelcomeModalProps {
  name: string;
  slug: string;
}

const STORAGE_KEY = "enghub_welcome_seen";

const STEPS = [
  {
    icon: UserCircle,
    label: "Complete seu perfil",
    description: "Foto, bio, cidade e contato",
    href: "/dashboard/perfil",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    icon: FolderOpen,
    label: "Publique um projeto",
    description: "Mostre seu trabalho com fotos",
    href: "/dashboard/projetos/novo",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    icon: Briefcase,
    label: "Cadastre seus serviços",
    description: "Informe o que você oferece",
    href: "/dashboard/servicos",
    color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
  },
];

export function WelcomeModal({ name, slug }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function close() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  const firstName = name.split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 pt-8 pb-6 text-center">
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10"
          >
            <X size={16} />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-700">
            <Rocket size={26} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Bem-vindo ao EngHub, {firstName}! 🎉
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Seu perfil em{" "}
            <span className="font-medium text-zinc-200">enghub.com.br/{slug}</span>{" "}
            está pronto. Siga os passos abaixo para começar a receber clientes.
          </p>
        </div>

        {/* Steps */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {STEPS.map((step, i) => (
            <Link
              key={step.href}
              href={step.href}
              onClick={close}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                <step.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {i + 1}. {step.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.description}</p>
              </div>
              <span className="text-xs text-zinc-400">→</span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <button
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
          >
            <CheckCircle2 size={15} />
            Entendido, vamos lá!
          </button>
          <p className="mt-2 text-center text-xs text-zinc-400">
            Este guia também aparece no painel sempre que houver passos pendentes.
          </p>
        </div>
      </div>
    </div>
  );
}
