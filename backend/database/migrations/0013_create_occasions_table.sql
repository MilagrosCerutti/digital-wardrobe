-- Occasion catalog (§18): admin-manageable, includes a formality_hint used
-- only as a soft ranking bias by Inspire Me (never a hard filter).
create table if not exists occasions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  formality_hint text not null
    check (formality_hint in ('CASUAL', 'SMART_CASUAL', 'FORMAL', 'VERY_FORMAL')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on occasions
  for each row execute function set_updated_at();

grant select, insert, update, delete on public.occasions to service_role;
