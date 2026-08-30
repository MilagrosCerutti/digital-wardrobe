-- Baseline extensions and shared conventions for all subsequent migrations.

create extension if not exists "pgcrypto";

-- Reusable trigger function: keeps an `updated_at` column current on every row update.
-- Attach with: create trigger set_updated_at before update on <table>
--   for each row execute function set_updated_at();
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
