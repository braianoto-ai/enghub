import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { QuoteForm } from "./quote-form";
import { getInitials, engineeringAreaLabels } from "@/lib/utils";

export default async function OrcamentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) notFound();

  const { data: prof } = await supabase
    .from("professional_profiles")
    .select("city, state, avatar_url, areas")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const areas = (prof?.areas ?? []) as string[];
  const initials = getInitials(tenant.name);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-md">
        <Link
          href={`/${slug}`}
          className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 text-xs font-bold text-white">E</span>
          <span className="hidden font-semibold text-white sm:block">EngHub</span>
        </Link>
        <ThemeToggle variant="ghost-light" />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/${slug}`}
            className="mb-5 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} />
            Voltar ao perfil
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 text-lg font-bold text-white overflow-hidden shadow-lg shadow-gray-900/30">
              {prof?.avatar_url ? (
                <Image src={prof.avatar_url} alt={tenant.name} fill className="object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Solicitar orçamento</p>
              <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
              {areas.length > 0 && (
                <p className="mt-0.5 text-sm text-zinc-400">
                  {areas.slice(0, 2).map((a) => engineeringAreaLabels[a] ?? a).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <QuoteForm
            tenantId={tenant.id}
            tenantName={tenant.name}
            tenantSlug={slug}
            areas={areas}
          />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Seus dados serão usados apenas para responder ao seu orçamento.
        </p>
      </div>
    </div>
  );
}
