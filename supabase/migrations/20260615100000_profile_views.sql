-- Tabela de visitas ao perfil público
create table if not exists profile_views (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null references tenants(id) on delete cascade,
  page        text        not null default 'portfolio',
  referrer    text,
  created_at  timestamptz not null default now()
);

create index if not exists profile_views_tenant_id_idx  on profile_views(tenant_id);
create index if not exists profile_views_created_at_idx on profile_views(tenant_id, created_at desc);

-- RLS
alter table profile_views enable row level security;

-- Visitantes anônimos podem inserir
create policy "anyone_insert_profile_views" on profile_views
  for insert with check (true);

-- Profissional lê apenas as próprias visitas
create policy "tenant_select_profile_views" on profile_views
  for select using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );
