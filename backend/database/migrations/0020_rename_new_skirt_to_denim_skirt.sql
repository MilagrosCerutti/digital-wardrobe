-- Product-requested rename: the "New Skirt" catalog item is user-facing
-- as "Denim Skirt". No other change -- same asset_url ('bottom-skirt'),
-- same asset file, same color.
update doll_items set name = 'Denim Skirt' where asset_url = 'bottom-skirt';
