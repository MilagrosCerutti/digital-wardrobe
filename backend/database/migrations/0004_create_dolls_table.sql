create table if not exists dolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  body_type text not null default 'AVERAGE' check (body_type in ('SLIM', 'AVERAGE', 'CURVY')),
  skin_tone text not null default 'MEDIUM'
    check (skin_tone in ('PORCELAIN', 'LIGHT', 'MEDIUM', 'TAN', 'DEEP')),
  hair_style text not null default 'LONG' check (hair_style in ('LONG', 'SHORT', 'PONYTAIL', 'BUN')),
  hair_color text not null default 'BROWN'
    check (hair_color in ('BLONDE', 'BROWN', 'BLACK', 'RED', 'PASTEL_PINK', 'PASTEL_LILAC')),
  eye_color text not null default 'BROWN' check (eye_color in ('BROWN', 'BLUE', 'GREEN', 'HAZEL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on dolls
  for each row execute function set_updated_at();

-- This project's default grants do not automatically extend to new tables (see 0003).
grant select, insert, update, delete on public.dolls to service_role;
