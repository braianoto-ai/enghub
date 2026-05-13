-- Conversations table (one per visitor contact thread)
create table if not exists conversations (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        uuid        not null references tenants(id) on delete cascade,
  visitor_name     text        not null,
  visitor_email    text        not null,
  visitor_phone    text,
  status           text        not null default 'open' check (status in ('open', 'closed')),
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- Messages table
create table if not exists messages (
  id               uuid        primary key default gen_random_uuid(),
  conversation_id  uuid        not null references conversations(id) on delete cascade,
  tenant_id        uuid        not null references tenants(id) on delete cascade,
  sender           text        not null check (sender in ('visitor', 'professional')),
  content          text        not null,
  read             boolean     not null default false,
  created_at       timestamptz not null default now()
);

-- Indexes
create index if not exists conversations_tenant_id_idx       on conversations(tenant_id);
create index if not exists conversations_last_message_at_idx on conversations(last_message_at desc);
create index if not exists messages_conversation_id_idx      on messages(conversation_id);
create index if not exists messages_read_idx                 on messages(conversation_id, sender, read) where read = false;

-- RLS
alter table conversations enable row level security;
alter table messages       enable row level security;

-- Visitors can create conversations (anonymous insert)
create policy "visitors_insert_conversations" on conversations
  for insert with check (true);

-- Tenants can read/update their own conversations
create policy "tenant_select_conversations" on conversations
  for select using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

create policy "tenant_update_conversations" on conversations
  for update using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

-- Visitors can create messages
create policy "visitors_insert_messages" on messages
  for insert with check (true);

-- Tenants can read/update their own messages
create policy "tenant_select_messages" on messages
  for select using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

create policy "tenant_update_messages" on messages
  for update using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

-- Enable realtime for live chat
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
