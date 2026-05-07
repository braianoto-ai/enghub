import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Shield, MessageSquare, Calendar } from "lucide-react";
import { ImageGallery } from "../../image-gallery";
import { engineeringAreaLabels } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) return { title: "Projeto não encontrado" };

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, image_url, area")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!project) return { title: "Projeto não encontrado" };

  const areaLabel = engineeringAreaLabels[project.area] ?? project.area;

  return {
    title: `${project.title} — ${tenant.name}`,
    description:
      project.description?.slice(0, 155) ??
      `Projeto de ${areaLabel} por ${tenant.name} no EngHub.`,
    alternates: { canonical: `/${slug}/projetos/${id}` },
    openGraph: {
      title: `${project.title} — ${tenant.name}`,
      description: project.description?.slice(0, 155) ?? "",
      ...(project.image_url && {
        images: [{ url: project.image_url, width: 1200, height: 630 }],
      }),
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, area, location, description, image_url, created_at, project_images(url, position)")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!project) notFound();

  // Fetch other projects for "Veja também"
  const { data: otherProjects } = await supabase
    .from("projects")
    .select("id, title, area, image_url, project_images(url, position)")
    .eq("tenant_id", tenant.id)
    .eq("status", "PUBLISHED")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  const galleryImages = (
    (project.project_images as { url: string; position: number }[] | null) ?? []
  )
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  const images =
    galleryImages.length > 0
      ? galleryImages
      : project.image_url
      ? [project.image_url]
      : [];

  const areaLabel = engineeringAreaLabels[project.area] ?? project.area;
  const formattedDate = new Date(project.created_at).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-md dark:border-white/5">
        <Link href={`/${slug}`} className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 text-xs font-bold text-white">E</span>
          <span className="hidden font-semibold text-white sm:block">EngHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}/contato`}
            className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-600"
          >
            Solicitar orçamento
          </Link>
          <ThemeToggle variant="ghost-light" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
          <Link href={`/${slug}`} className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">
            {tenant.name}
          </Link>
          <span>/</span>
          <Link href={`/${slug}/projetos`} className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">
            Projetos
          </Link>
          <span>/</span>
          <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">{project.title}</span>
        </nav>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {areaLabel}
            </span>
            {project.location && (
              <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin size={14} />
                {project.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
              <Calendar size={14} />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <ImageGallery images={images} title={project.title} />
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Sobre o projeto</h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
              {project.description}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mb-10 rounded-2xl border border-gray-300 bg-gray-100 p-6 text-center dark:border-gray-700/40 dark:bg-gray-800/10">
          <Shield size={24} className="mx-auto mb-3 text-gray-500" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Gostou deste projeto?
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Entre em contato com {tenant.name} para um orçamento personalizado.
          </p>
          <Link
            href={`/${slug}/contato`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
          >
            <MessageSquare size={15} />
            Solicitar Orçamento
          </Link>
        </div>

        {/* Veja também */}
        {otherProjects && otherProjects.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Outros projetos</h2>
              <Link
                href={`/${slug}/projetos`}
                className="text-sm font-medium text-gray-700 hover:underline dark:text-gray-400"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {otherProjects.map((p) => {
                const pGallery = (
                  (p.project_images as { url: string; position: number }[] | null) ?? []
                )
                  .sort((a, b) => a.position - b.position)
                  .map((img) => img.url);
                const thumb = pGallery[0] ?? p.image_url ?? null;
                return (
                  <Link
                    key={p.id}
                    href={`/${slug}/projetos/${p.id}`}
                    className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-tranzinc-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {thumb ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800" />
                    )}
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-zinc-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-gray-400">
                        {p.title}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
                        {engineeringAreaLabels[p.area] ?? p.area}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
