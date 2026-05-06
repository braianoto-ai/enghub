import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { engineeringAreaLabels } from "@/lib/utils";
import { ProjetosActions } from "./projetos-actions";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, area, status, location, created_at, image_url")
    .eq("tenant_id", tenant?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="mt-1 text-gray-500">Gerencie seu portfólio de projetos</p>
        </div>
        <Link href="/dashboard/projetos/novo">
          <Button>
            <Plus size={16} className="mr-2" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="group overflow-hidden">
                {project.image_url && (
                  <div className="relative h-36 w-full">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="info">
                          {engineeringAreaLabels[project.area]}
                        </Badge>
                        <Badge
                          variant={
                            project.status === "PUBLISHED"
                              ? "success"
                              : project.status === "DRAFT"
                              ? "warning"
                              : "default"
                          }
                        >
                          {project.status === "PUBLISHED"
                            ? "Publicado"
                            : project.status === "DRAFT"
                            ? "Rascunho"
                            : "Arquivado"}
                        </Badge>
                      </div>
                      {project.location && (
                        <p className="mt-2 text-xs text-gray-400">
                          {project.location}
                        </p>
                      )}
                    </div>
                    <ProjetosActions projectId={project.id} tenantId={tenant?.id ?? ""} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <FolderOpen size={32} className="text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">
                Nenhum projeto ainda
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Adicione projetos para mostrar seu trabalho
              </p>
              <Link href="/dashboard/projetos/novo">
                <Button variant="outline" size="sm" className="mt-4">
                  Criar primeiro projeto
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
