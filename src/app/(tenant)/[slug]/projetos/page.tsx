import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjetosClient } from "./projetos-client";

export default async function ProjetosPage({
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

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, area, location, description, image_url, project_images(url, position)")
    .eq("tenant_id", tenant.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/${slug}`}
            className="mb-4 flex items-center gap-2 text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar ao perfil
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Projetos de {tenant.name}
          </h1>
          <p className="mt-1 text-blue-100">
            {projects?.length ?? 0} projeto{(projects?.length ?? 0) !== 1 ? "s" : ""} publicado{(projects?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProjetosClient projects={projects ?? []} slug={slug} />
      </div>
    </div>
  );
}
