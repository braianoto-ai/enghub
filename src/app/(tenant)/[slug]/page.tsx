import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import { ImageGallery } from "./image-gallery";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <Avatar name={tenant.name} size="lg" className="h-24 w-24 text-2xl" />
            <div className="text-white">
              <h1 className="text-3xl font-bold">{tenant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {primaryArea && (
                  <Badge className="bg-white/20 text-white">
                    {engineeringAreaLabels[primaryArea]}
                  </Badge>
                )}
                {registrationBadge && (
                  <Badge className="bg-white/20 text-white">
                    <Shield size={12} className="mr-1" />
                    {registrationBadge}
                  </Badge>
                )}
              </div>
              {(prof?.city || prof?.state) && (
                <div className="mt-2 flex items-center justify-center gap-1 text-blue-100 sm:justify-start">
                  <MapPin size={16} />
                  {[prof.city, prof.state].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Phone size={16} />
                    {contactPhone}
                  </a>
                )}
                {prof?.website && (
                  <a
                    href={prof.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Globe size={16} />
                    Website
                    <ExternalLink size={12} />
                  </a>
                )}
                {!contactPhone && !prof?.website && (
                  <p className="text-sm text-gray-400">Nenhum contato informado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">
                  {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                </p>
                <StarRating rating={Math.round(avgRating)} size={20} />
                <p className="mt-1 text-sm text-gray-500">
                  {reviews?.length ?? 0} avaliações
                </p>
              </CardContent>
            </Card>

            {prof?.areas && prof.areas.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {prof.areas.map((area: string) => (
                    <Badge key={area} variant="info">
                      {engineeringAreaLabels[area]}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            <Link href={`/${slug}/contato`}>
              <Button className="w-full" size="lg">
                Solicitar Orçamento
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {prof?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-gray-600">{prof.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    {prof.years_experience && prof.years_experience > 0 && (
                      <span>{prof.years_experience} anos de experiência</span>
                    )}
                    {prof.education && <span>{prof.education}</span>}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projetos</CardTitle>
                  {projects && projects.length > 0 && (
                    <Link
                      href={`/${slug}/projetos`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver todos
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!projects || projects.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">
                    Nenhum projeto publicado ainda
                  </p>
                ) : (
                  <div className="space-y-6">
                    {projects.map((project) => {
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

                      return (
                        <div
                          key={project.id}
                          className="overflow-hidden rounded-xl border hover:shadow-sm transition-shadow"
                        >
                          {images.length > 0 && (
                            <ImageGallery images={images} title={project.title} />
                          )}
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900">{project.title}</h4>
                            {project.location && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                <MapPin size={12} />
                                {project.location}
                              </p>
                            )}
                            <Badge variant="info" className="mt-2">
                              {engineeringAreaLabels[project.area]}
                            </Badge>
                            {project.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Serviços</CardTitle>
                  {services && services.length > 0 && (
                    <Link
                      href={`/${slug}/servicos`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver todos
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!services || services.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">
                    Nenhum serviço cadastrado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <Badge variant="info" className="mt-1">
                            {engineeringAreaLabels[service.area]}
                          </Badge>
                          {service.description && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                        {service.price_from && (
                          <p className="ml-4 shrink-0 text-sm font-medium text-gray-900">
                            A partir de{" "}
                            {Number(service.price_from).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews list */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {reviews.map((r, i) => {
                      const author = r.author as unknown as { name: string } | null;
                      const displayName = (r as { reviewer_name?: string | null }).reviewer_name ?? author?.name ?? "Anônimo";
                      return (
                        <li key={i} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{displayName}</p>
                              <p className="text-sm text-yellow-500">
                                {"★".repeat(r.rating)}
                                {"☆".repeat(5 - r.rating)}
                                <span className="ml-1 text-gray-400">{r.rating}/5</span>
                              </p>
                              {r.comment && (
                                <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
                              )}
                            </div>
                            <p className="shrink-0 text-xs text-gray-400">
                              {new Date(r.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MessageSquare size={24} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Ainda sem avaliações</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review form */}
            <Card>
              <CardHeader>
                <CardTitle>Deixe sua avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm tenantId={tenant.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
