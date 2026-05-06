import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { blogPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/buscar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/planos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/cadastro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Tenant profiles
  const { data: tenants } = await supabase
    .from("tenants")
    .select("slug, updated_at")
    .eq("status", "ACTIVE")
    .order("updated_at", { ascending: false });

  const profilePages: MetadataRoute.Sitemap = (tenants ?? []).map((t) => ({
    url: `${BASE_URL}/${t.slug}`,
    lastModified: new Date(t.updated_at ?? new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Projects pages
  const { data: projects } = await supabase
    .from("projects")
    .select("id, tenant_id, updated_at, tenants!inner(slug, status)")
    .eq("status", "PUBLISHED")
    .eq("tenants.status", "ACTIVE")
    .order("updated_at", { ascending: false });

  const projectPages: MetadataRoute.Sitemap = (projects ?? []).map((p) => {
    const tenant = Array.isArray(p.tenants) ? p.tenants[0] : p.tenants;
    return {
      url: `${BASE_URL}/${(tenant as { slug: string }).slug}/projetos/${p.id}`,
      lastModified: new Date(p.updated_at ?? new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticPages, ...blogPages, ...profilePages, ...projectPages];
}
