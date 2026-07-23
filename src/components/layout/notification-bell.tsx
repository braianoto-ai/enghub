"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, MessageSquare, Star, Check, X } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "message" | "review";
  title: string;
  body: string;
  href: string;
  read: boolean;
  created_at: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnread(data.unread);
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?offset=${notifications.length}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Poll a cada 30s para novas notificações
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  }

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Notificações"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header do dropdown */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Notificações
              </span>
              {unread > 0 && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-700/40 dark:text-gray-300">
                  {unread} nova{unread > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-800 dark:text-gray-400"
              >
                <Check size={12} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
                <Bell size={28} className="opacity-30" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {notifications.map((n) => (
                  <li key={n.id} className={!n.read ? "bg-gray-100/60 dark:bg-gray-800/10" : ""}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        if (!n.read) markOneRead(n.id);
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      {/* Ícone */}
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          n.type === "message"
                            ? "bg-gray-200 dark:bg-gray-800/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        {n.type === "message" ? (
                          <MessageSquare size={15} className="text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Star size={15} className="text-yellow-500" />
                        )}
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>

                      {/* Bolinha não lida */}
                      {!n.read && (
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-700" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {hasMore && (
              <div className="px-4 py-2 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50 dark:text-gray-400"
                >
                  {loadingMore ? "Carregando..." : "Carregar mais"}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
              <Link
                href="/dashboard/mensagens"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-gray-700 hover:text-gray-800 dark:text-gray-400"
              >
                Ver todas as mensagens →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
