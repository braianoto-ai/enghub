"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const STORAGE_KEY = "enghub_pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Não mostra se já instalado ou já dispensado
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    if (isIOS()) {
      // iOS não dispara beforeinstallprompt — mostra instrução manual após 8s
      const t = setTimeout(() => setShowIOSHint(true), 8000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setShowIOSHint(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") dismiss();
    setVisible(false);
  }

  // Banner Android/Chrome
  if (visible && installEvent) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50">
              <Download size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Instalar o EngHub
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Adicione à tela inicial para acesso rápido, mesmo sem internet.
              </p>
            </div>
            <button onClick={dismiss} className="shrink-0 text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="flex-1 rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-600"
            >
              Instalar app
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instrução manual iOS
  if (showIOSHint) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50">
              <Share size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Instalar no iPhone
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Toque em{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  Compartilhar <Share size={10} className="inline" />
                </span>{" "}
                e depois em{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  "Adicionar à Tela de Início"
                </span>
                .
              </p>
            </div>
            <button onClick={dismiss} className="shrink-0 text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
