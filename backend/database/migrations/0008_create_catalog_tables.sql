-- Controlled catalog tables backing ClothingItem classification (§18).
-- Admin-manageable later via is_active; Fit and FormalityLevel are fixed
-- application-level enums (not catalogs) and are validated in code instead.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patterns (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hex text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists styles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on categories for each row execute function set_updated_at();
create trigger set_updated_at before update on subcategories for each row execute function set_updated_at();
create trigger set_updated_at before update on materials for each row execute function set_updated_at();
create trigger set_updated_at before update on patterns for each row execute function set_updated_at();
create trigger set_updated_at before update on colors for each row execute function set_updated_at();
create trigger set_updated_at before update on styles for each row execute function set_updated_at();

grant select, insert, update, delete on public.categories to service_role;
grant select, insert, update, delete on public.subcategories to service_role;
grant select, insert, update, delete on public.materials to service_role;
grant select, insert, update, delete on public.patterns to service_role;
grant select, insert, update, delete on public.colors to service_role;
grant select, insert, update, delete on public.styles to service_role;
