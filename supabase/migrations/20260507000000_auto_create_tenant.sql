-- Atualiza o trigger handle_new_user para criar automaticamente
-- o tenant e professional_profile quando o usuário é PROFESSIONAL.
-- Isso garante que o profissional apareça na busca imediatamente.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
  v_slug text;
  v_area text;
  v_tenant_id uuid;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'CLIENT');

  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    v_role
  );

  if v_role = 'PROFESSIONAL' then
    v_slug := coalesce(new.raw_user_meta_data->>'slug', replace(lower(coalesce(new.raw_user_meta_data->>'name', new.email)), ' ', '-'));
    v_area := new.raw_user_meta_data->>'area';

    insert into public.tenants (slug, name, owner_id, status)
    values (
      v_slug,
      coalesce(new.raw_user_meta_data->>'name', new.email),
      new.id,
      'ACTIVE'
    )
    returning id into v_tenant_id;

    insert into public.professional_profiles (tenant_id, areas)
    values (
      v_tenant_id,
      case when v_area is not null and v_area != '' then array[v_area::engineering_area] else '{}' end
    );
  end if;

  return new;
end;
$$;
