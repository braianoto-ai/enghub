import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Star } from "lucide-react";
import { TenantActions } from "./tenant-actions";

export default async function TenantsPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, slug, plan, status, featured, created_at, owner:profiles(name, email)")
    .order("created_at", { ascending: false });

  const planColors: Record<string, "default" | "info" | "success" | "warning"> = {
    FREE: "default",
    PRO: "info",
    EMPRESA: "success",
    PREMIUM: "warning",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="mt-1 text-gray-500">
            {tenants?.length ?? 0} tenant{(tenants?.length ?? 0) !== 1 ? "s" : ""} cadastrado{(tenants?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Destaque</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Cadastro</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants && tenants.length > 0 ? (
                tenants.map((tenant) => {
                  const owner = tenant.owner as unknown as { name: string; email: string } | null;
                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        {owner?.email && (
                          <p className="text-xs text-gray-400">{owner.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tenant.slug}</td>
                      <td className="px-6 py-4">
                        <Badge variant={planColors[tenant.plan] ?? "default"}>
                          {tenant.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={tenant.status === "ACTIVE" ? "success" : tenant.status === "SUSPENDED" ? "danger" : "warning"}>
                          {tenant.status === "ACTIVE" ? "Ativo" : tenant.status === "SUSPENDED" ? "Suspenso" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.featured ? (
                          <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                            <Star size={14} className="fill-yellow-500 text-yellow-500" />
                            Destaque
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <TenantActions tenantId={tenant.id} currentStatus={tenant.status} currentPlan={tenant.plan} featured={tenant.featured ?? false} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                    Nenhum tenant cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
