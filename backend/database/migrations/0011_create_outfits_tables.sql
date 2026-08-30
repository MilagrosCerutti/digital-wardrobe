-- Outfit.occasion/mood are intentionally omitted here: they belong to the
-- Inspire Me quick-mode flow, which is not yet an implementation phase.
-- Add them additively (see database/migrations/README.md convention) once
-- that phase exists, rather than carrying unused columns now.
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text,
  source text not null default 'MANUAL' check (source in ('MANUAL', 'GENERATED')),
  compatibility_score integer not null check (compatibility_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits(id) on delete cascade,
  clothing_item_id uuid not null references clothing_items(id),
  created_at timestamptz not null default now(),
  unique (outfit_id, clothing_item_id)
);

create index if not exists outfits_user_id_idx on outfits(user_id);

create trigger set_updated_at
  before update on outfits
  for each row execute function set_updated_at();

grant select, insert, update, delete on public.outfits to service_role;
grant select, insert, update, delete on public.outfit_items to service_role;
