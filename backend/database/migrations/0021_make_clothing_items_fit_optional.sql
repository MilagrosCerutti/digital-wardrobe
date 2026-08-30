-- Fit (SLIM/REGULAR/OVERSIZED/RELAXED) doesn't meaningfully describe every
-- category -- accessories in particular don't have a "fit" -- so it's no
-- longer a required field when adding a clothing item. The check constraint
-- (valid enum values when present) already allows null implicitly; only the
-- not-null constraint needs to be dropped.
alter table clothing_items alter column fit drop not null;
