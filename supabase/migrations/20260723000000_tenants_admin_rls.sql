-- Corrige RLS de tenants: dono só pode editar campos de perfil, nunca
-- plan/status/featured/stripe_*/owner_id. Admin (SUPER_ADMIN) ganha
-- policy própria para poder aprovar/mudar plano de qualquer tenant.
--
-- Antes desta migration, a policy de update só checava `owner_id = auth.uid()`
-- sem restringir colunas, permitindo que o próprio dono se auto-promovesse
-- (plan=PREMIUM, status=ACTIVE, featured=true) via chamada direta à API do
-- Supabase. Além disso, o painel admin (que usa o client do browser, sujeito
-- a RLS) não tinha nenhuma policy que permitisse alterar tenants de outros
-- donos — os toggles de aprovação/plano no admin provavelmente falhavam
-- silenciosamente em produção.

-- Garante que as colunas usadas pelo painel admin existem (idempotente).
alter table public.tenants
  add column if not exists featured boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
$$;

-- Admin pode ler/atualizar qualquer tenant.
drop policy if exists "Admins leem qualquer tenant" on public.tenants;
create policy "Admins leem qualquer tenant"
  on public.tenants for select
  using (public.is_admin());

drop policy if exists "Admins atualizam qualquer tenant" on public.tenants;
create policy "Admins atualizam qualquer tenant"
  on public.tenants for update
  using (public.is_admin())
  with check (public.is_admin());

-- Trigger: bloqueia alteração de colunas administrativas por quem não é
-- admin nem service_role (Stripe webhook, cron, etc. usam createAdminClient
-- e por isso rodam como service_role, que segue liberado).
create or replace function public.tenants_protect_admin_columns()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.status := old.status;
  new.plan := old.plan;
  new.featured := old.featured;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  return new;
end;
$$;

drop trigger if exists tenants_protect_admin_columns_trigger on public.tenants;
create trigger tenants_protect_admin_columns_trigger
  before update on public.tenants
  for each row execute function public.tenants_protect_admin_columns();
