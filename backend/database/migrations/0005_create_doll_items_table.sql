create table if not exists doll_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('TOP', 'BOTTOM', 'SHOES', 'ACCESSORY')),
  layer integer not null,
  asset_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on doll_items
  for each row execute function set_updated_at();

grant select, insert, update, delete on public.doll_items to service_role;
