-- Denim Skirt is removed from the active My Doll wardrobe by product
-- decision (its planned replacement, Light Blue Jeans, does not yet pass
-- visual integration testing against the Master Doll -- see
-- frontend/src/features/doll/assets/doll/garments/lightblue-jeans.png and
-- ASSET_SPEC.md -- so no bottom garment is exposed to users until a
-- correctly-scaled replacement asset is produced and wired into
-- WARDROBE_RASTER_ASSETS / APPROVED_DOLL_ITEM_ASSET_KEYS).
-- Cream Tank (top-tank) is untouched. 0017 was already applied, so this is
-- a new migration rather than an edit to it.
delete from doll_items where asset_url = 'bottom-skirt';
