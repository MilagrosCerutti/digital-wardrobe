-- Additive columns anticipated by 0011's comment: populated only for
-- Inspire Me generated outfits. Mood is a fixed code-level enum (not a
-- catalog, per §8.1/§18), enforced here with a check constraint the same
-- way fit/formality_level are on clothing_items.
alter table outfits
  add column if not exists occasion_id uuid references occasions(id),
  add column if not exists mood text
    check (mood in ('CONFIDENT', 'RELAXED', 'PLAYFUL', 'ROMANTIC', 'COZY', 'BOLD'));
