create table if not exists clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  image_url text not null,
  category_id uuid not null references categories(id),
  subcategory_id uuid not null references subcategories(id),
  material_id uuid not null references materials(id),
  pattern_id uuid not null references patterns(id),
  fit text not null check (fit in ('SLIM', 'REGULAR', 'OVERSIZED', 'RELAXED')),
  formality_level text not null
    check (formality_level in ('CASUAL', 'SMART_CASUAL', 'FORMAL', 'VERY_FORMAL')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clothing_item_colors (
  clothing_item_id uuid not null references clothing_items(id) on delete cascade,
  color_id uuid not null references colors(id),
  primary key (clothing_item_id, color_id)
);

create table if not exists clothing_item_styles (
  clothing_item_id uuid not null references clothing_items(id) on delete cascade,
  style_id uuid not null references styles(id),
  primary key (clothing_item_id, style_id)
);

create index if not exists clothing_items_user_id_idx on clothing_items(user_id);

create trigger set_updated_at
  before update on clothing_items
  for each row execute function set_updated_at();

grant select, insert, update, delete on public.clothing_items to service_role;
grant select, insert, update, delete on public.clothing_item_colors to service_role;
grant select, insert, update, delete on public.clothing_item_styles to service_role;
