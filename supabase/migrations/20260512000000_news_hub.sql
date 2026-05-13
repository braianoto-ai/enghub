-- ==================== NEWS HUB ====================
-- Tabelas para o agregador de notícias de engenharia e arquitetura
-- Armazena apenas título, trecho e link para o artigo original (compliance legal)

create type news_category as enum (
  'ENGINEERING',
  'ARCHITECTURE',
  'NORMS',
  'TECHNOLOGY'
);

-- Fontes RSS cadastradas
create table public.news_sources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  rss_url text not null unique,
  category news_category not null,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

-- Artigos ingeridos dos feeds RSS
-- Nunca armazena conteúdo completo, apenas o que vem no feed
create table public.news_articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text not null,          -- max 300 chars do próprio feed
  url text not null unique,       -- link para o artigo original
  image_url text,
  published_at timestamptz not null,
  source_id uuid references public.news_sources(id) on delete cascade not null,
  category news_category not null,
  created_at timestamptz default now() not null
);

-- Índices para performance nas queries mais comuns
create index news_articles_category_idx on public.news_articles(category);
create index news_articles_published_at_idx on public.news_articles(published_at desc);
create index news_articles_source_id_idx on public.news_articles(source_id);

-- RLS: artigos e fontes são públicos (conteúdo aberto)
alter table public.news_sources enable row level security;
alter table public.news_articles enable row level security;

create policy "Fontes são públicas"
  on public.news_sources for select using (active = true);

create policy "Artigos são públicos"
  on public.news_articles for select using (true);

-- ==================== SEED: FONTES INICIAIS ====================

insert into public.news_sources (name, url, rss_url, category) values
  -- Arquitetura internacional
  ('ArchDaily',       'https://www.archdaily.com',          'https://www.archdaily.com/feed',                        'ARCHITECTURE'),
  ('Dezeen',          'https://www.dezeen.com',             'https://www.dezeen.com/feed/',                          'ARCHITECTURE'),
  -- Engenharia internacional
  ('Engineering News-Record', 'https://www.enr.com',        'https://www.enr.com/rss/articles',                      'ENGINEERING'),
  ('Construction Dive','https://www.constructiondive.com',  'https://www.constructiondive.com/feeds/news/',           'ENGINEERING'),
  -- Tecnologia / BIM
  ('AECbytes',        'https://www.aecbytes.com',           'https://www.aecbytes.com/rss.xml',                      'TECHNOLOGY'),
  -- Brasil
  ('AECweb',          'https://www.aecweb.com.br',          'https://www.aecweb.com.br/rss/noticias.xml',            'ENGINEERING');
