"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";

export default function UsuariosAdminPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="mt-1 text-gray-500">
          Gerencie os usuários da plataforma
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input placeholder="Buscar usuários..." className="pl-10" />
        </div>
        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option>Todos os roles</option>
          <option>Profissional</option>
          <option>Cliente</option>
          <option>Admin</option>
        </select>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Cadastro
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <Users size={32} className="mx-auto mb-2 text-gray-300" />
                  Nenhum usuário cadastrado
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
