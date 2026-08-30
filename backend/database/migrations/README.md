# Migrations

Migrations are plain SQL files, applied in order against the Supabase PostgreSQL database.

## Convention

- File name: `NNNN_short_description.sql` (e.g. `0002_create_users_table.sql`), zero-padded and sequential.
- Each migration is additive and forward-only; corrections are made with a new migration rather than editing a committed one.
- Apply migrations through the Supabase SQL Editor or the Supabase CLI, in ascending numeric order.
- A migration that adds a table with an `updated_at` column should attach the `set_updated_at()` trigger defined in `0001_init.sql`.

## Applied migrations

| File | Purpose |
| --- | --- |
| `0001_init.sql` | Baseline extensions and the shared `set_updated_at()` trigger function used by later entity tables. |
| `0002_create_users_table.sql` | `users` table (auth identity, role, status) backing registration and login. |
| `0003_grant_service_role_users.sql` | Explicit `service_role` grants on `users` (this project's defaults didn't extend automatically). |
| `0004_create_dolls_table.sql` | `dolls` table (one per user, appearance attributes) + `service_role` grants. |
| `0005_create_doll_items_table.sql` | `doll_items` global catalog (predefined equippable assets) + `service_role` grants. |
| `0006_create_doll_equipment_table.sql` | `doll_equipment` join table (currently-equipped items per doll) + `service_role` grants. |
| `0007_seed_doll_items.sql` | Seed catalog rows for `doll_items` (placeholder color-based assets; see file comment). |
| `0008_create_catalog_tables.sql` | Closet catalogs: `categories`, `subcategories`, `materials`, `patterns`, `colors`, `styles` + `service_role` grants. |
| `0009_seed_catalog_data.sql` | Seed rows for all six closet catalog tables. |
| `0010_create_clothing_items_tables.sql` | `clothing_items` + `clothing_item_colors`/`clothing_item_styles` join tables + `service_role` grants. |
| `0011_create_outfits_tables.sql` | `outfits` + `outfit_items` (Style It manual outfits) + `service_role` grants. `occasion`/`mood` deferred until Inspire Me exists. |
| `0012_add_favorite_to_clothing_items.sql` | `is_favorite` column on `clothing_items`. |
| `0013_create_occasions_table.sql` | `occasions` catalog (name + `formality_hint`, used only as a soft ranking bias) + `service_role` grants. |
| `0014_add_occasion_mood_to_outfits.sql` | Additive `occasion_id`/`mood` columns on `outfits`, anticipated by `0011`'s comment. |
| `0015_seed_occasions.sql` | Seed rows for the `occasions` catalog. |
| `0016_add_dress_and_color_to_doll_items.sql` | Adds `doll_items.color` (not null) and `DRESS` to the category check constraint, for the layered 2D doll rework. |
| `0017_reseed_doll_items_layered_wardrobe.sql` | Replaces the placeholder doll_items rows with the two garments that have passed raster visual-integration testing: Cream Tank and Denim Skirt. |
| `0018_remove_denim_skirt_from_doll_items.sql` | Removes Denim Skirt; its planned replacement (Light Blue Jeans) doesn't yet pass visual alignment testing. Cream Tank untouched. |
| `0019_add_tanks_and_skirt_to_doll_items.sql` | Adds Blue Tank, Black Tank, and a corrected New Skirt (all passed raster alignment testing). |
| `0020_rename_new_skirt_to_denim_skirt.sql` | Renames "New Skirt" to "Denim Skirt" (user-facing name only; same asset). |
| `0021_make_clothing_items_fit_optional.sql` | Drops the not-null constraint on `clothing_items.fit` (not every category, e.g. accessories, has a meaningful fit). |
