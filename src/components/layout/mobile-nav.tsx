"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FolderOpen,
  Inbox,
  User,
  MoreHorizontal,
  X,
  Wrench,
  Star,
  BarChart2,
  Gift,
  ShieldCheck,
  Calendar,
  CreditCard,
  Quote,
  LogOut,
  ExternalLink,
  Menu,
} from "lucide-react";

const bottomItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: Inbox },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

const drawerItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/dashboard/servicos", label: "Serviços", icon: Wrench },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/dashboard/depoimentos", label: "Depoimentos", icon: Quote },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: Inbox },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/indicacoes", label: "Indicações", icon: Gift },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/plano", label: "Plano", icon: CreditCard },
  { href: "/dashboard/verificacao", label: "Verificação", icon: ShieldCheck },
];

interface MobileNavProps {
  tenant?: { id: string; name: string; slug: string; plan: string; avatar_url?: string | null } | null;
  user?: { email?: string } | null;
  unreadMessages?: number;
}

export function MobileNav({ tenant, user, unreadMessages = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Bottom bar — only on mobile/tablet */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 safe-bottom">
        {bottomItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const isMensagens = item.href === "/dashboard/mensagens";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-gray-900 dark:text-zinc-100"
                  : "text-gray-400 dark:text-zinc-500"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{item.label}</span>
              {isMensagens && unreadMessages > 0 && (
                <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-700 px-1 text-[9px] font-bold text-white">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium text-gray-400 dark:text-zinc-500"
        >
          <Menu size={22} strokeWidth={1.5} />
          <span>Mais</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white pb-safe dark:bg-zinc-900 transition-transform duration-300",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "85dvh", overflowY: "auto" }}
      >
        {/* Drawer handle */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
          {tenant && (
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-800 dark:bg-gray-700/40 dark:text-gray-400 overflow-hidden">
                {tenant.avatar_url ? (
                  <Image src={tenant.avatar_url} alt={tenant.name} fill className="object-cover" />
                ) : (
                  getInitials(tenant.name)
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{tenant.name}</p>
                <Link
                  href={`/${tenant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:underline dark:text-zinc-400"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ExternalLink size={10} />
                  Ver perfil público
                </Link>
              </div>
            </div>
          )}
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="grid grid-cols-2 gap-1 p-4">
          {drawerItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const isMensagens = item.href === "/dashboard/mensagens";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800/40 dark:text-zinc-100"
                    : "text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {isMensagens && unreadMessages > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-700 px-1 text-[9px] font-bold text-white">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 dark:border-zinc-800">
          <p className="mb-2 truncate px-3 text-xs text-gray-400 dark:text-zinc-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </>
  );
}
