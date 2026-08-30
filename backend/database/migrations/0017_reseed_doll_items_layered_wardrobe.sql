-- Replaces the placeholder single-shape-per-category catalog (0007) with the
-- real raster-illustrated wardrobe. Existing rows are removed (cascading to
-- doll_equipment -- equipped items reset, which is expected since their old
-- asset_url values were hex colors from the pre-rework geometric renderer
-- and no longer mean anything under the raster layering system).
--
-- Seeded here are exactly the two garments that have passed visual
-- integration testing against the Master Doll raster
-- (frontend/src/features/doll/assets/wardrobeRaster.ts and
-- APPROVED_DOLL_ITEM_ASSET_KEYS): Cream Tank and Denim Skirt. Further
-- garments/colors should be added the same way -- one insert per
-- approved asset key + color -- once they've passed that same test.
-- asset_url must match a key in WARDROBE_RASTER_ASSETS (or, for
-- not-yet-rasterized items, WARDROBE_ASSET_COMPONENTS in wardrobe.ts).

delete from doll_items;

insert into doll_items (name, category, layer, asset_url, color) values
  ('Cream Tank', 'TOP', 20, 'top-tank', '#FCEEE3'),
  ('Denim Skirt', 'BOTTOM', 10, 'bottom-skirt', '#8FB4D9');
