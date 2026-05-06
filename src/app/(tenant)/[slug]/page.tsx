import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import { ImageGallery } from "./image-gallery";
import { ViewTracker } from "./view-tracker";
import { WhatsAppButton } from "./whatsapp-button";
import {
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Shield,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { engineeringAreaLabels } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) return { title: "Profissional não encontrado" };

  const [{ data: prof }, { data: firstProject }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("bio, areas, city, state")
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("image_url")
      .eq("tenant_id", tenant.id)
      .eq("status", "PUBLISHED")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const primaryArea = prof?.areas?.[0]
    ? engineeringAreaLabels[prof.areas[0]] ?? prof.areas[0]
    : null;

  const location = [prof?.city, prof?.state].filter(Boolean).join(", ");
  const titleParts = [tenant.name, primaryArea].filter(Boolean).join(" — ");
  const description =
    prof?.bio?.slice(0, 155) ??
    [
      `Perfil profissional de ${tenant.name}`,
      primaryArea && `especialista em ${primaryArea}`,
      location && `em ${location}`,
      "no EngHub. Veja projetos, serviços e avaliações.",
    ]
      .filter(Boolean)
      .join(" ");

  const ogImage = firstProject?.image_url
    ? { url: firstProject.image_url, width: 1200, height: 630, alt: tenant.name }
    : undefined;

  return {
    title: titleParts,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: titleParts,
      description,
      type: "profile",
      url: `/${slug}`,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: titleParts,
      description,
      ...(ogImage && { images: [ogImage.url] }),
    },
  };
}

export default async function TenantPage({
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

  const [
    { data: prof },
    { data: projects },
    { data: services },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select(
        "bio, phone, whatsapp, website, linkedin, instagram, crea, cau, areas, city, state, years_experience, certifications, education"
      )
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("id, title, area, location, description, image_url, project_images(url, position)")
      .eq("tenant_id", tenant.id)
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("services")
      .select("id, title, area, price_from, description")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("reviews")
      .select("rating, comment, created_at, reviewer_name, author:profiles(name)")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const primaryArea = prof?.areas?.[0] ?? null;
  const contactPhone = prof?.whatsapp ?? prof?.phone ?? null;
  const registrationBadge = prof?.crea ?? prof?.cau ?? null;

  const initials = tenant.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ViewTracker tenantId={tenant.id} />
      {prof?.whatsapp && <WhatsAppButton phone={prof.whatsapp} name={tenant.name} />}

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/50 px-4 pb-16 pt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-20 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-2xl font-bold text-white shadow-lg shadow-violet-900/30">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{tenant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {primaryArea && (
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-0.5 text-sm text-violet-200">
                    {engineeringAreaLabels[primaryArea]}
                  </span>
                )}
                {registrationBadge && (
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-0.5 text-sm text-zinc-300">
                    <Shield size={12} className="text-violet-400" />
                    {registrationBadge}
                  </span>
                )}
              </div>
              {(prof?.city || prof?.state) && (
                <p className="mt-2 flex items-center justify-center gap-1 text-sm text-zinc-400 sm:justify-start">
                  <MapPin size={13} />
                  {[prof.city, prof.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {[
              { value: reviews?.length ?? 0, label: "Avaliações" },
              { value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: "Nota média" },
              { value: prof?.years_experience ? `${prof.years_experience}` : "—", label: "Anos exp." },
            ].map((s) => (
              <div key={s.label} className="px-4 py-4 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <Link href={`/${slug}/contato`}>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500">
                Solicitar Orçamento
                <MessageSquare size={15} />
              </button>
            </Link>

            {/* Contato */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contato</h3>
              <div className="space-y-2">
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                    <Phone size={14} /> {contactPhone}
                  </a>
                )}
                {prof?.website && (
                  <a href={prof.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                    <Globe size={14} /> Website <ExternalLink size={11} />
                  </a>
                )}
                {!contactPhone && !prof?.website && (
                  <p className="text-sm text-zinc-400">Nenhum contato informado</p>
                )}
              </div>
            </div>

            {/* Especialidades */}
            {prof?.areas && prof.areas.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {prof.areas.map((area: string) => (
                    <span key={area} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                      {engineeringAreaLabels[area]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliação */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </p>
              <StarRating rating={Math.round(avgRating)} size={18} />
              <p className="mt-1 text-xs text-zinc-400">{reviews?.length ?? 0} avaliações</p>
            </div>
          </div>

          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bio */}
            {prof?.bio && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Sobre</h2>
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{prof.bio}</p>
                {(prof.years_experience || prof.education) && (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    {prof.years_experience && prof.years_experience > 0 && (
                      <span className="text-sm text-zinc-500">{prof.years_experience} anos de experiência</span>
                    )}
                    {prof.education && <span className="text-sm text-zinc-500">{prof.education}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Projetos */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Projetos</h2>
                {projects && projects.length > 0 && (
                  <Link href={`/${slug}/projetos`} className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400">
                    Ver todos →
                  </Link>
                )}
              </div>
              {!projects || projects.length === 0 ? (
                <p className="py-8 text-center text-zinc-400">Nenhum projeto publicado ainda</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => {
                    const galleryImages = (
                      (project.project_images as { url: string; position: number }[] | null) ?? []
                    ).sort((a, b) => a.position - b.position).map((img) => img.url);
                    const images = galleryImages.length > 0 ? galleryImages : project.image_url ? [project.image_url] : [];
                    return (
                      <div key={project.id} className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                        {images.length > 0 && <ImageGallery images={images} title={project.title} />}
                        <div className="p-3">
                          <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{project.title}</h4>
                          {project.location && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                              <MapPin size={11} />{project.location}
                            </p>
                          )}
                          <span className="mt-2 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                            {engineeringAreaLabels[project.area]}
                          </span>
                          {project.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{project.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Serviços */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Serviços</h2>
                {services && services.length > 0 && (
                  <Link href={`/${slug}/servicos`} className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400">
                    Ver todos →
                  </Link>
                )}
              </div>
              {!services || services.length === 0 ? (
                <p className="py-8 text-center text-zinc-400">Nenhum serviço cadastrado ainda</p>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{service.title}</h4>
                        <span className="mt-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                          {engineeringAreaLabels[service.area]}
                        </span>
                        {service.description && (
                          <p className="mt-1 text-sm text-zinc-500 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                        {service.price_from && (
                          <p className="ml-4 shrink-0 text-sm font-semibold text-violet-600 dark:text-violet-400">
                            A partir de{" "}
                            {Number(service.price_from).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Avaliações */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Avaliações</h2>
              {reviews && reviews.length > 0 ? (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {reviews.map((r, i) => {
                    const author = r.author as unknown as { name: string } | null;
                    const displayName = (r as { reviewer_name?: string | null }).reviewer_name ?? author?.name ?? "Anônimo";
                    return (
                      <li key={i} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{displayName}</p>
                            <p className="text-sm text-yellow-500">
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                              <span className="ml-1 text-xs text-zinc-400">{r.rating}/5</span>
                            </p>
                            {r.comment && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.comment}</p>}
                          </div>
                          <p className="shrink-0 text-xs text-zinc-400">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <MessageSquare size={24} className="text-zinc-300" />
                  <p className="text-sm text-zinc-400">Ainda sem avaliações</p>
                </div>
              )}
            </div>

            {/* Formulário de avaliação */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Deixe sua avaliação</h2>
              <ReviewForm tenantId={tenant.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
