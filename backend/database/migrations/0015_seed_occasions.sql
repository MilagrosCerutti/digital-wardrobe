insert into occasions (name, formality_hint) values
  ('Casual Day', 'CASUAL'),
  ('Weekend Errands', 'CASUAL'),
  ('Work', 'SMART_CASUAL'),
  ('Date Night', 'SMART_CASUAL'),
  ('Party', 'FORMAL'),
  ('Formal Event', 'VERY_FORMAL')
on conflict (name) do nothing;
