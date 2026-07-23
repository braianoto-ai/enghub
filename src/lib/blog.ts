import { createAdminClient } from "@/lib/supabase/admin";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  publishedAt: string;
  author: { name: string; initials: string; role: string };
  isAiGenerated?: boolean;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, category, read_time, published_at, author_name, author_initials, author_role, is_ai_generated")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    readTime: p.read_time,
    publishedAt: p.published_at,
    author: { name: p.author_name, initials: p.author_initials, role: p.author_role },
    isAiGenerated: p.is_ai_generated,
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, category, read_time, published_at, author_name, author_initials, author_role, is_ai_generated")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;

  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    readTime: data.read_time,
    publishedAt: data.published_at,
    author: { name: data.author_name, initials: data.author_initials, role: data.author_role },
    isAiGenerated: data.is_ai_generated,
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
