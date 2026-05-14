-- Add reply fields to reviews table
alter table reviews
  add column if not exists reply      text,
  add column if not exists reply_at   timestamptz,
  add column if not exists visible    boolean not null default true;

-- Allow anonymous inserts (visitors leaving reviews)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'reviews' and policyname = 'anyone_insert_reviews'
  ) then
    create policy "anyone_insert_reviews" on reviews
      for insert with check (true);
  end if;
end $$;

-- Allow tenant to update their own reviews (to add reply)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'reviews' and policyname = 'tenant_update_reviews'
  ) then
    create policy "tenant_update_reviews" on reviews
      for update using (
        tenant_id in (select id from tenants where owner_id = auth.uid())
      );
  end if;
end $$;
