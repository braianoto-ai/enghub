-- Expande os status das conversas para o fluxo de orçamento completo
-- open → pending (em análise), + accepted, in_progress, completed, closed

-- Remove a constraint antiga
alter table conversations drop constraint if exists conversations_status_check;

-- Migra os existentes: 'open' vira 'pending'
update conversations set status = 'pending' where status = 'open';

-- Adiciona nova constraint com todos os status
alter table conversations
  add constraint conversations_status_check
  check (status in ('pending', 'accepted', 'in_progress', 'completed', 'closed'));

-- Atualiza o default
alter table conversations alter column status set default 'pending';
