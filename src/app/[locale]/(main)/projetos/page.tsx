import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjetosPublicosClient } from "./projetos-publicos-client";

export const metadata: Metadata = {
  title: "Projetos de Engenharia | EngHub",
  description:
    "Explore projetos reais de engenharia civil, mecânica, elétrica, arquitetura e mais. Portfólios verificados de profissionais de todo o Brasil.",
  alternates: { canonical: "/projetos" },
  openGraph: {
    title: "Projetos de Engenharia | EngHub",
    description: "Explore o portfólio de projetos dos melhores engenheiros do Brasil.",
    url: "/projetos",
  },
};

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      area,
      location,
      description,
      image_url,
      tenant_id,
      tenants (
        name,
        slug
      )
    `)
    .eq("status", "PUBLISHED")
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(60);

  const items = (projects ?? []).map((p) => {
    const tenant = Array.isArray(p.tenants) ? p.tenants[0] : p.tenants;
    return {
      id: p.id,
      title: p.title,
      area: p.area as string,
      location: p.location ?? null,
      description: p.description ?? null,
      image_url: p.image_url as string,
      tenant_name: tenant?.name ?? "",
      tenant_slug: tenant?.slug ?? "",
    };
  });

  return (
    <ProjetosPublicosClient
      projects={items}
      initialArea={area ?? ""}
    />
  );
}
