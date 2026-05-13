"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Only show if: browser supports push, not already subscribed, not dismissed
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    const dismissed = localStorage.getItem("push-prompt-dismissed");
    if (dismissed) return;

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (!sub) {
          // Show prompt after 5 seconds
          const timer = setTimeout(() => setShow(true), 5000);
          return () => clearTimeout(timer);
        }
      });
    });
  }, []);

  async function subscribe() {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setShow(false);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setSubscribing(false);
    }
  }

  function dismiss() {
    localStorage.setItem("push-prompt-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Ativar notificações?
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Receba alertas de novos orçamentos, avaliações e mensagens em tempo real.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={subscribe}
            disabled={subscribing}
            className="flex-1 rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            {subscribing ? "Ativando..." : "Ativar notificações"}
          </button>
          <button
            onClick={dismiss}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
