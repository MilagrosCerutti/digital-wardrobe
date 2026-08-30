-- The service_role should have full trusted access to application tables;
-- this project's default grants did not extend to `users` automatically.
grant select, insert, update, delete on public.users to service_role;
