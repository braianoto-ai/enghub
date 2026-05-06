import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
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
import { AvailabilityBadge, type AvailabilityStatus } from "@/components/availability-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Shield,
  ShieldCheck,
  MessageSquare,
  FileText,
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
  const t = await getTranslations("profile");

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
        "bio, phone, whatsapp, website, linkedin, instagram, crea, cau, crea_cau_verified, crea_cau_type, crea_cau_number, areas, city, state, years_experience, certifications, education, availability, curriculum_url, avatar_url"
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
  const registrationBadge = prof?.crea_cau_number ?? prof?.crea ?? prof?.cau ?? null;
  const isVerified = prof?.crea_cau_verified === true;

  const initials = tenant.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ViewTracker tenantId={tenant.id} />
      {prof?.whatsapp && <WhatsAppButton phone={prof.whatsapp} name={tenant.name} />}

      {/* ── TOP NAV ── */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-md dark:border-white/5">
        <Link href="/buscar" className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 text-xs font-bold text-white">E</span>
          <span className="hidden font-semibold text-white sm:block">EngHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}/contato`}
            className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-600"
          >
            {t("request_quote")}
          </Link>
          <ThemeToggle variant="ghost-light" />
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50 px-4 pb-16 pt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-20 h-80 w-80 rounded-full bg-gray-700/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-gray-1000/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 text-2xl font-bold text-white shadow-lg shadow-gray-900/30 overflow-hidden">
              {prof?.avatar_url ? (
                <Image
                  src={prof.avatar_url}
                  alt={tenant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{tenant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {primaryArea && (
                  <span className="rounded-full border border-gray-400/30 bg-gray-1000/15 px-3 py-0.5 text-sm text-gray-300">
                    {engineeringAreaLabels[primaryArea]}
                  </span>
                )}
                {registrationBadge && (
                  <span className={`flex items-center gap-1 rounded-full border px-3 py-0.5 text-sm ${
                    isVerified
                      ? "border-green-500/40 bg-green-500/15 text-green-300"
                      : "border-white/10 bg-white/10 text-zinc-300"
                  }`}>
                    {isVerified
                      ? <ShieldCheck size={12} className="text-green-400" />
                      : <Shield size={12} className="text-gray-400" />
                    }
                    {registrationBadge}
                    {isVerified && <span className="ml-0.5 text-xs text-green-400">✓</span>}
                  </span>
                )}
                {prof?.availability && (
                  <AvailabilityBadge status={prof.availability as AvailabilityStatus} />
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
              { value: reviews?.length ?? 0, label: t("rating") },
              { value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: t("avg_rating") },
              { value: prof?.years_experience ? `${prof.years_experience}` : "—", label: t("years_abbr") },
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
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <Link href={`/${slug}/contato`}>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-600">
                {t("request_quote")}
                <MessageSquare size={15} />
              </button>
            </Link>

            {prof?.curriculum_url && (
              <a
                href={prof.curriculum_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <FileText size={15} />
                {t("download_cv")}
              </a>
            )}

            {/* Contato */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("contact")}</h3>
              <div className="space-y-2">
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-gray-400">
                    <Phone size={14} /> {contactPhone}
                  </a>
                )}
                {prof?.website && (
                  <a href={prof.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-600 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-gray-400">
                    <Globe size={14} /> Website <ExternalLink size={11} />
                  </a>
                )}
                {!contactPhone && !prof?.website && (
                  <p className="text-sm text-zinc-400">{t("no_contact")}</p>
                )}
              </div>
            </div>

            {/* Especialidades */}
            {prof?.areas && prof.areas.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("specialties")}</h3>
                <div className="flex flex-wrap gap-2">
                  {prof.areas.map((area: string) => (
                    <span key={area} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
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
              <p className="mt-1 text-xs text-zinc-400">{t("rating_count", { count: reviews?.length ?? 0 })}</p>
              {isVerified && (
                <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800/40 dark:bg-green-900/10">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                    {prof?.crea_cau_type ?? "CREA/CAU"} verificado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bio */}
            {prof?.bio && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">{t("about")}</h2>
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{prof.bio}</p>
                {(prof.years_experience || prof.education) && (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    {prof.years_experience && prof.years_experience > 0 && (
                      <span className="text-sm text-zinc-500">{prof.years_experience} {t("years_exp")}</span>
                    )}
                    {prof.education && <span className="text-sm text-zinc-500">{prof.education}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Projetos */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t("projects")}</h2>
                {projects && projects.length > 0 && (
                  <Link href={`/${slug}/projetos`} className="text-sm font-medium text-gray-700 hover:underline dark:text-gray-400">
                    {t("see_all")}
                  </Link>
                )}
              </div>
              {!projects || projects.length === 0 ? (
                <p className="py-8 text-center text-zinc-400">{t("no_projects")}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => {
                    const galleryImages = (
                      (project.project_images as { url: string; position: number }[] | null) ?? []
                    ).sort((a, b) => a.position - b.position).map((img) => img.url);
                    const images = galleryImages.length > 0 ? galleryImages : project.image_url ? [project.image_url] : [];
                    return (
                      <Link
                        key={project.id}
                        href={`/${slug}/projetos/${project.id}`}
                        className="group overflow-hidden rounded-xl border border-zinc-100 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
                      >
                        {images.length > 0 && <ImageGallery images={images} title={project.title} />}
                        <div className="p-3">
                          <h4 className="font-medium text-zinc-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-gray-400">{project.title}</h4>
                          {project.location && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                              <MapPin size={11} />{project.location}
                            </p>
                          )}
                          <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
                            {engineeringAreaLabels[project.area]}
                          </span>
                          {project.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{project.description}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Serviços */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t("services")}</h2>
                {services && services.length > 0 && (
                  <Link href={`/${slug}/servicos`} className="text-sm font-medium text-gray-700 hover:underline dark:text-gray-400">
                    {t("see_all")}
                  </Link>
                )}
              </div>
              {!services || services.length === 0 ? (
                <p className="py-8 text-center text-zinc-400">{t("no_services")}</p>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{service.title}</h4>
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
                          {engineeringAreaLabels[service.area]}
                        </span>
                        {service.description && (
                          <p className="mt-1 text-sm text-zinc-500 line-clamp-1">{service.description}</p>
                          )}
                        </div>
                        {service.price_from && (
                          <p className="ml-4 shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-400">
                            {t("from_price")}{" "}
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
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">{t("reviews")}</h2>
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
                  <p className="text-sm text-zinc-400">{t("no_reviews")}</p>
                </div>
              )}
            </div>

            {/* Formulário de avaliação */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">{t("leave_review")}</h2>
              <ReviewForm tenantId={tenant.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
