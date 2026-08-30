-- Adds the three newly-approved raster garments (frontend
-- WARDROBE_RASTER_ASSETS / APPROVED_DOLL_ITEM_ASSET_KEYS, wardrobeRaster.ts):
-- two more Tank color variants, and a corrected Skirt replacing the one
-- removed in 0018 (whose planned jeans replacement failed alignment
-- testing; a new skirt asset was produced instead and has now passed it).
-- Cream Tank (top-tank) is untouched.
insert into doll_items (name, category, layer, asset_url, color) values
  ('Blue Tank', 'TOP', 20, 'top-tank-blue', '#A9C6E0'),
  ('Black Tank', 'TOP', 20, 'top-tank-black', '#2B2118'),
  ('New Skirt', 'BOTTOM', 10, 'bottom-skirt', '#8FB4D9');
