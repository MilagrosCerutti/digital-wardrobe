-- My Doll rework: doll_items.asset_url now holds an internal asset key
-- identifying an illustrated garment component (see frontend
-- features/doll/assets/wardrobe.ts), not a placeholder hex color or a raw
-- image URL. Each color variant of a garment silhouette is its own catalog
-- row sharing the same asset_url, distinguished by this new `color` column.
-- DRESS is added as a category because a dress is a one-piece outfit
-- distinct from separately combined TOP + BOTTOM pieces (see doll.service.ts
-- equipItem's category-replacement rules).

alter table doll_items add column if not exists color text;

update doll_items set color = '#F2A7C3' where color is null;

alter table doll_items alter column color set not null;

alter table doll_items drop constraint if exists doll_items_category_check;
alter table doll_items add constraint doll_items_category_check
  check (category in ('TOP', 'BOTTOM', 'DRESS', 'SHOES', 'ACCESSORY'));
