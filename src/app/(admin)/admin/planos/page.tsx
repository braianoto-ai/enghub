"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";

const defaultPlans = [
  {
    name: "Gratuito",
    type: "FREE",
    price: 0,
    maxProjects: 5,
    maxTeam: 1,
    status: "Ativo",
  },
  {
    name: "Pro",
    type: "PRO",
    price: 49,
    maxProjects: -1,
    maxTeam: 1,
    status: "Ativo",
  },
  {
    name: "Empresa",
    type: "EMPRESA",
    price: 129,
    maxProjects: -1,
    maxTeam: 10,
    status: "Ativo",
  },
  {
    name: "Premium",
    type: "PREMIUM",
    price: 299,
    maxProjects: -1,
    maxTeam: -1,
    status: "Ativo",
  },
];

export default function PlanosAdminPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Planos
          </h1>
          <p className="mt-1 text-gray-500">
            Configure os planos da plataforma
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Novo Plano
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Projetos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Equipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {defaultPlans.map((plan) => (
                <tr key={plan.type} className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{plan.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    R$ {plan.price}/mês
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {plan.maxProjects === -1 ? "Ilimitado" : plan.maxProjects}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {plan.maxTeam === -1 ? "Ilimitado" : plan.maxTeam}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">{plan.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
