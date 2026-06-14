"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { engineeringAreaLabels } from "@/lib/utils";
import { AvailabilitySwitcher, type AvailabilityStatus } from "@/components/availability-switcher";
import { CurriculumUpload } from "@/components/curriculum-upload";
import { AvatarUpload } from "@/components/avatar-upload";
import { AiBioButton } from "@/components/ai-bio-button";

interface PerfilFormProps {
  tenant: { id: string; name: string; slug: string; description?: string | null } | null;
  profile: {
    bio?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    website?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    crea?: string | null;
    cau?: string | null;
    areas?: string[];
    city?: string | null;
    state?: string | null;
    years_experience?: number | null;
    education?: string | null;
    availability?: AvailabilityStatus | null;
    curriculum_url?: string | null;
    avatar_url?: string | null;
    tenant_id?: string;
  } | null;
}

export function PerfilForm({ tenant, profile }: PerfilFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const profileData = {
      bio: formData.get("bio") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      website: formData.get("website") as string,
      linkedin: formData.get("linkedin") as string,
      instagram: formData.get("instagram") as string,
      crea: formData.get("crea") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      years_experience: Number(formData.get("years_experience")) || null,
      education: formData.get("education") as string,
    };

    const tenantData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    const [{ error: tenantErr }, { error: profileErr }] = await Promise.all([
      supabase.from("tenants").update(tenantData).eq("id", tenant?.id ?? ""),
      supabase
        .from("professional_profiles")
        .update(profileData)
        .eq("tenant_id", tenant?.id ?? ""),
    ]);

    if (tenantErr || profileErr) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  function getBioFormData() {
    if (!formRef.current) return {};
    const fd = new FormData(formRef.current);
    return {
      name: fd.get("name") as string,
      areas: profile?.areas ?? [],
      city: fd.get("city") as string,
      state: fd.get("state") as string,
      years_experience: Number(fd.get("years_experience")) || undefined,
      education: fd.get("education") as string,
      crea: fd.get("crea") as string,
    };
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-6">
      {tenant?.id && (
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <AvatarUpload
            tenantId={tenant.id}
            currentUrl={profile?.avatar_url}
            name={tenant.name}
          />
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Perfil atualizado com sucesso!
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="name"
            name="name"
            label="Nome / Razão social"
            defaultValue={tenant?.name ?? ""}
            required
          />
          <Input
            id="phone"
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
            defaultValue={profile?.phone ?? ""}
          />
          <Input
            id="whatsapp"
            name="whatsapp"
            label="WhatsApp"
            placeholder="(11) 99999-9999"
            defaultValue={profile?.whatsapp ?? ""}
          />
          <Input
            id="crea"
            name="crea"
            label="CREA / CAU"
            placeholder="SP-123456/D"
            defaultValue={profile?.crea ?? ""}
          />
          <Input
            id="city"
            name="city"
            label="Cidade"
            placeholder="São Paulo"
            defaultValue={profile?.city ?? ""}
          />
          <Input
            id="state"
            name="state"
            label="Estado"
            placeholder="SP"
            defaultValue={profile?.state ?? ""}
          />
          <Input
            id="years_experience"
            name="years_experience"
            label="Anos de experiência"
            type="number"
            placeholder="10"
            defaultValue={profile?.years_experience ?? ""}
          />
          <Input
            id="education"
            name="education"
            label="Formação"
            placeholder="Engenharia Civil - USP"
            defaultValue={profile?.education ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Descrição do perfil
            </label>
            <textarea
              name="description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              rows={2}
              placeholder="Breve descrição que aparece na busca"
              defaultValue={tenant?.description ?? ""}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Bio completa
              </label>
              <AiBioButton getFormData={getBioFormData} onGenerated={setBio} />
            </div>
            <textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              rows={4}
              placeholder="Descreva sua experiência e especialidades... ou clique em 'Gerar com IA'"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="website"
            name="website"
            label="Website"
            placeholder="https://seusite.com"
            defaultValue={profile?.website ?? ""}
          />
          <Input
            id="linkedin"
            name="linkedin"
            label="LinkedIn"
            placeholder="https://linkedin.com/in/seuperfil"
            defaultValue={profile?.linkedin ?? ""}
          />
          <Input
            id="instagram"
            name="instagram"
            label="Instagram"
            placeholder="@seuperfil"
            defaultValue={profile?.instagram ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currículo em PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">
            Suba seu currículo em PDF. Ele aparece como botão "Baixar currículo" no seu perfil público.
          </p>
          {tenant?.id && (
            <CurriculumUpload
              tenantId={tenant.id}
              currentUrl={profile?.curriculum_url}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">
            Este status aparece no seu perfil público para que clientes saibam sua disponibilidade.
          </p>
          {tenant?.id && (
            <AvailabilitySwitcher
              tenantId={tenant.id}
              initial={(profile?.availability as AvailabilityStatus) ?? "available"}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={loading}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
