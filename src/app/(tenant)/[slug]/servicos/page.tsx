import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { engineeringAreaLabels } from "@/lib/utils";
import Link from "next/link";

export default async function ServicosPage({
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

  const { data: services } = await supabase
    .from("services")
    .select("id, title, area, description, price_from, price_to")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const areas = [...new Set((services ?? []).map((s) => s.area))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/${slug}`}
            className="mb-4 flex items-center gap-2 text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar ao perfil
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Serviços de {tenant.name}
          </h1>
          <p className="mt-1 text-blue-100">
            {services?.length ?? 0} serviço{(services?.length ?? 0) !== 1 ? "s" : ""} disponível{(services?.length ?? 0) !== 1 ? "is" : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!services || services.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Wrench size={40} className="text-gray-300" />
            <p className="text-gray-500">Nenhum serviço disponível</p>
          </div>
        ) : (
          <div className="space-y-10">
            {areas.map((area) => {
              const areaServices = services.filter((s) => s.area === area);
              return (
                <div key={area}>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {engineeringAreaLabels[area] ?? area}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {areaServices.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900">
                              {service.title}
                            </h3>
                            <Badge variant="info" className="mt-1">
                              {engineeringAreaLabels[service.area] ?? service.area}
                            </Badge>
                          </div>
                          {service.price_from && (
                            <div className="shrink-0 text-right">
                              <p className="text-xs text-gray-400">A partir de</p>
                              <p className="font-semibold text-gray-900">
                                {Number(service.price_from).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </p>
                              {service.price_to && (
                                <p className="text-xs text-gray-400">
                                  até{" "}
                                  {Number(service.price_to).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {service.description && (
                          <p className="mt-3 text-sm leading-relaxed text-gray-500">
                            {service.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-4 text-center">
              <Link href={`/${slug}/contato`}>
                <Button size="lg">Solicitar orçamento</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
