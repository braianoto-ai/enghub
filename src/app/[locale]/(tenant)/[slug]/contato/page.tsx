import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ChatClient } from "./chat-client";
import { getInitials } from "@/lib/utils";

export default async function ContatoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const tp = await getTranslations("profile");
  const tc = await getTranslations("contact");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) notFound();

  const { data: prof } = await supabase
    .from("professional_profiles")
    .select("phone, whatsapp, website, city, state, avatar_url")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const initials = getInitials(tenant.name);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-md">
        <Link href={`/${slug}`} className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 text-xs font-bold text-white">E</span>
          <span className="hidden font-semibold text-white sm:block">EngHub</span>
        </Link>
        <ThemeToggle variant="ghost-light" />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link href={`/${slug}`} className="mb-5 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft size={15} />
            {tp("back_to_profile")}
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
              <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
              {(prof?.city || prof?.state) && (
                <p className="mt-0.5 text-sm text-zinc-400">
                  {[prof.city, prof.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ChatClient
          tenantId={tenant.id}
          tenantName={tenant.name}
          tenantSlug={slug}
          avatarUrl={prof?.avatar_url ?? null}
          phone={prof?.phone ?? null}
          whatsapp={prof?.whatsapp ?? null}
          website={prof?.website ?? null}
        />
      </div>
    </div>
  );
}
