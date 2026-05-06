import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageCircle, Globe, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ContatoForm } from "./contato-form";

export default async function ContatoPage({
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

  const { data: prof } = await supabase
    .from("professional_profiles")
    .select("phone, whatsapp, website, city, state")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const whatsappLink = prof?.whatsapp
    ? `https://wa.me/55${prof.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/${slug}`}
            className="mb-6 flex items-center gap-2 text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar ao perfil
          </Link>
          <div className="flex items-center gap-4">
            <Avatar name={tenant.name} size="lg" className="h-16 w-16 text-xl" />
            <div className="text-white">
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              {(prof?.city || prof?.state) && (
                <p className="mt-1 text-sm text-blue-100">
                  {[prof.city, prof.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Canais de contato direto */}
        {(prof?.phone || prof?.whatsapp || prof?.website) && (
          <Card>
            <CardHeader>
              <CardTitle>Contato direto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prof?.whatsapp && (
                <a
                  href={whatsappLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={20} />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm">{prof.whatsapp}</p>
                  </div>
                </a>
              )}
              {prof?.phone && (
                <a
                  href={`tel:${prof.phone}`}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Phone size={20} />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm">{prof.phone}</p>
                  </div>
                </a>
              )}
              {prof?.website && (
                <a
                  href={prof.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Globe size={20} />
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-sm">{prof.website}</p>
                    </div>
                    <ExternalLink size={14} className="ml-auto text-gray-400" />
                  </div>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Formulário de mensagem */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <ContatoForm tenantId={tenant.id} tenantName={tenant.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
