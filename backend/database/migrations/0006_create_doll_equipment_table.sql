create table if not exists doll_equipment (
  id uuid primary key default gen_random_uuid(),
  doll_id uuid not null references dolls(id) on delete cascade,
  doll_item_id uuid not null references doll_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (doll_id, doll_item_id)
);

grant select, insert, update, delete on public.doll_equipment to service_role;
