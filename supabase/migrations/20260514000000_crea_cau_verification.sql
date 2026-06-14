-- Campos de verificação CREA/CAU em professional_profiles.
-- Criados manualmente no Supabase Cloud — migration adicionada para documentar e garantir reprodutibilidade.

alter table professional_profiles
  add column if not exists crea_cau_number      text,
  add column if not exists crea_cau_type        text,
  add column if not exists crea_cau_status      text not null default 'NONE',
  add column if not exists crea_cau_verified    boolean not null default false,
  add column if not exists crea_cau_notes       text,
  add column if not exists crea_cau_reviewed_at timestamptz;

-- Constraint de status válidos
alter table professional_profiles
  drop constraint if exists crea_cau_status_check;

alter table professional_profiles
  add constraint crea_cau_status_check
  check (crea_cau_status in ('NONE', 'PENDING', 'APPROVED', 'REJECTED'));
