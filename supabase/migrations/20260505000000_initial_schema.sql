-- ==================== ENUMS ====================

create type user_role as enum ('SUPER_ADMIN', 'PROFESSIONAL', 'CLIENT');
create type plan_type as enum ('FREE', 'PRO', 'EMPRESA', 'PREMIUM');
create type tenant_status as enum ('ACTIVE', 'SUSPENDED', 'PENDING');
create type project_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type engineering_area as enum (
  'CIVIL', 'MECANICA', 'ELETRICA', 'QUIMICA',
  'AMBIENTAL', 'FLORESTAL', 'PRODUCAO', 'ALIMENTOS',
  'COMPUTACAO', 'ARQUITETURA', 'AGRONOMIA', 'OUTRA'
);

-- ==================== PROFILES ====================
-- Estende auth.users do Supabase

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role user_role default 'CLIENT' not null,
  image text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles são públicos para leitura"
  on public.profiles for select using (true);

create policy "Usuários atualizam o próprio perfil"
  on public.profiles for update using (auth.uid() = id);

create policy "Usuários inserem o próprio perfil"
  on public.profiles for insert with check (auth.uid() = id);

-- Trigger para criar profile automaticamente quando usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'CLIENT')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==================== TENANTS ====================

create table public.tenants (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text,
  logo text,
  cover_image text,
  status tenant_status default 'PENDING' not null,
  plan plan_type default 'FREE' not null,
  custom_domain text unique,
  owner_id uuid unique references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tenants enable row level security;

create policy "Tenants ativos são públicos"
  on public.tenants for select using (status = 'ACTIVE' or auth.uid() = owner_id);

create policy "Donos atualizam seus tenants"
  on public.tenants for update using (auth.uid() = owner_id);

create policy "Usuários criam tenants próprios"
  on public.tenants for insert with check (auth.uid() = owner_id);

-- ==================== PROFESSIONAL PROFILES ====================

create table public.professional_profiles (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid unique references public.tenants(id) on delete cascade not null,
  bio text,
  phone text,
  whatsapp text,
  website text,
  linkedin text,
  instagram text,
  crea text,
  cau text,
  registration_org text,
  areas engineering_area[] default '{}',
  city text,
  state text,
  country text default 'Brasil',
  years_experience int,
  education text,
  certifications text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.professional_profiles enable row level security;

create policy "Perfis profissionais são públicos"
  on public.professional_profiles for select using (true);

create policy "Donos atualizam o próprio perfil"
  on public.professional_profiles for all using (
    exists (
      select 1 from public.tenants
      where tenants.id = professional_profiles.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

-- ==================== TEAM MEMBERS ====================

create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  role text not null,
  email text,
  image text,
  bio text,
  crea text,
  created_at timestamptz default now() not null
);

alter table public.team_members enable row level security;

create policy "Team members são públicos"
  on public.team_members for select using (true);

create policy "Donos gerenciam team members"
  on public.team_members for all using (
    exists (
      select 1 from public.tenants
      where tenants.id = team_members.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

-- ==================== PROJECTS ====================

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  title text not null,
  description text,
  area engineering_area not null,
  status project_status default 'DRAFT' not null,
  location text,
  client text,
  start_date date,
  end_date date,
  value numeric,
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Projetos publicados são públicos"
  on public.projects for select using (
    status = 'PUBLISHED' or
    exists (
      select 1 from public.tenants
      where tenants.id = projects.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

create policy "Donos gerenciam seus projetos"
  on public.projects for all using (
    exists (
      select 1 from public.tenants
      where tenants.id = projects.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

-- ==================== PROJECT IMAGES ====================

create table public.project_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  url text not null,
  alt text,
  is_primary boolean default false,
  "order" int default 0
);

alter table public.project_images enable row level security;

create policy "Imagens são públicas"
  on public.project_images for select using (true);

create policy "Donos gerenciam imagens dos próprios projetos"
  on public.project_images for all using (
    exists (
      select 1 from public.projects p
      join public.tenants t on t.id = p.tenant_id
      where p.id = project_images.project_id
      and t.owner_id = auth.uid()
    )
  );

-- ==================== SERVICES ====================

create table public.services (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  title text not null,
  description text,
  area engineering_area not null,
  price_from numeric,
  price_to numeric,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.services enable row level security;

create policy "Serviços ativos são públicos"
  on public.services for select using (
    is_active = true or
    exists (
      select 1 from public.tenants
      where tenants.id = services.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

create policy "Donos gerenciam seus serviços"
  on public.services for all using (
    exists (
      select 1 from public.tenants
      where tenants.id = services.tenant_id
      and tenants.owner_id = auth.uid()
    )
  );

-- ==================== REVIEWS ====================

create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (author_id, tenant_id)
);

alter table public.reviews enable row level security;

create policy "Avaliações são públicas"
  on public.reviews for select using (true);

create policy "Usuários autenticados criam avaliações"
  on public.reviews for insert with check (auth.uid() = author_id);

create policy "Autores atualizam suas avaliações"
  on public.reviews for update using (auth.uid() = author_id);

create policy "Autores deletam suas avaliações"
  on public.reviews for delete using (auth.uid() = author_id);

-- ==================== PLANS ====================

create table public.plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type plan_type unique not null,
  price numeric not null,
  description text,
  max_projects int not null,
  max_team_members int default 1 not null,
  custom_domain boolean default false,
  features text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.plans enable row level security;

create policy "Planos são públicos"
  on public.plans for select using (true);

-- Seed inicial de planos
insert into public.plans (name, type, price, description, max_projects, max_team_members, custom_domain, features) values
  ('Gratuito', 'FREE', 0, 'Ideal para começar e mostrar seu trabalho', 5, 1, false,
    array['1 perfil profissional', 'Até 5 projetos no portfólio', 'Página pública básica', 'Aparecer nas buscas', 'Receber avaliações']),
  ('Pro', 'PRO', 49, 'Para profissionais que querem se destacar', -1, 1, true,
    array['Tudo do Gratuito', 'Projetos ilimitados', 'Subdomínio personalizado', 'Destaque nas buscas', 'Selo de verificado', 'Estatísticas de visitas', 'Suporte prioritário']),
  ('Empresa', 'EMPRESA', 129, 'Para escritórios e empresas de engenharia', -1, 10, true,
    array['Tudo do Pro', 'Até 10 membros na equipe', 'Página da empresa', 'Domínio próprio', 'Gestão de equipe', 'Relatórios avançados', 'API de integração']),
  ('Premium', 'PREMIUM', 299, 'Solução completa para grandes empresas', -1, -1, true,
    array['Tudo do Empresa', 'Membros ilimitados', 'Templates de documentos técnicos', 'Geração de ART/RRT', 'Integração com CREA', 'Gerente de conta dedicado', 'SLA garantido']);

-- ==================== INDEXES ====================

create index profiles_email_idx on public.profiles (email);
create index tenants_slug_idx on public.tenants (slug);
create index tenants_owner_idx on public.tenants (owner_id);
create index projects_tenant_idx on public.projects (tenant_id);
create index projects_area_idx on public.projects (area);
create index services_tenant_idx on public.services (tenant_id);
create index reviews_tenant_idx on public.reviews (tenant_id);
create index professional_profiles_areas_idx on public.professional_profiles using gin (areas);
create index professional_profiles_city_idx on public.professional_profiles (city);
