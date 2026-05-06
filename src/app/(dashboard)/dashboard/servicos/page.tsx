import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { engineeringAreaLabels } from "@/lib/utils";
import { ServicosActions } from "./servicos-actions";
import { Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: services } = await supabase
    .from("services")
    .select("id, title, area, price_from, price_to, is_active, description, created_at")
    .eq("tenant_id", tenant?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-1 text-gray-500">
            Gerencie os serviços que você oferece
          </p>
        </div>
        <Link href="/dashboard/servicos/novo">
          <Button>
            <Plus size={16} className="mr-2" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="group">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {service.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="info">
                          {engineeringAreaLabels[service.area]}
                        </Badge>
                        <Badge variant={service.is_active ? "success" : "warning"}>
                          {service.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {service.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                          {service.description}
                        </p>
                      )}
                      {service.price_from && (
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          A partir de{" "}
                          {Number(service.price_from).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      )}
                    </div>
                    <ServicosActions
                      serviceId={service.id}
                      isActive={service.is_active}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <Wrench size={32} className="text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">
                Nenhum serviço cadastrado
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Cadastre os serviços que você oferece para seus clientes
              </p>
              <Link href="/dashboard/servicos/novo">
                <Button variant="outline" size="sm" className="mt-4">
                  Adicionar serviço
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
