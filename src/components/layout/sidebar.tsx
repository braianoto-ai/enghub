"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FolderOpen,
  Wrench,
  User,
  Star,
  LogOut,
  ExternalLink,
  Inbox,
  CreditCard,
  BarChart2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/dashboard/servicos", label: "Serviços", icon: Wrench },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
  { href: "/dashboard/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: Inbox },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/plano", label: "Plano", icon: CreditCard },
];

interface SidebarProps {
  tenant?: { id: string; name: string; slug: string; plan: string } | null;
  user?: { email?: string } | null;
}

export function Sidebar({ tenant, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <span className="font-bold text-white">E</span>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-slate-100">EngHub</span>
      </div>

      {tenant && (
        <div className="border-b border-gray-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
              {getInitials(tenant.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">
                {tenant.name}
              </p>
              <p className="text-xs text-gray-500 capitalize dark:text-slate-400">{tenant.plan.toLowerCase()}</p>
            </div>
          </div>
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="mt-2 flex items-center gap-1 text-xs text-violet-600 hover:underline dark:text-violet-400"
          >
            <ExternalLink size={11} />
            Ver meu perfil público
          </Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-slate-800">
        <p className="truncate px-3 text-xs text-gray-400 dark:text-slate-500">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
