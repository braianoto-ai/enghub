import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Phone, Mail } from "lucide-react";

export default async function MensagensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, read, created_at")
    .eq("tenant_id", tenant?.id ?? "")
    .order("created_at", { ascending: false });

  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="mt-1 text-gray-500">
            Contatos recebidos pelo seu perfil
          </p>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {unread} não {unread === 1 ? "lida" : "lidas"}
          </span>
        )}
      </div>

      <div className="mt-8">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className={msg.read ? "" : "border-blue-200 bg-blue-50/30"}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{msg.name}</p>
                        {!msg.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                        <a
                          href={`mailto:${msg.email}`}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Mail size={14} />
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <a
                            href={`tel:${msg.phone}`}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <Phone size={14} />
                            {msg.phone}
                          </a>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <Inbox size={32} className="text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">
                Nenhuma mensagem ainda
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Quando clientes enviarem mensagens pelo seu perfil, aparecerão aqui
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
