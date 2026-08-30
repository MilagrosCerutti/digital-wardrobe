-- Placeholder catalog: `asset_url` holds a hex color rendered as a simple flat
-- shape by the frontend until real layered illustration assets are supplied.
-- Swapping in real assets later only requires updating these rows.
insert into doll_items (name, category, layer, asset_url) values
  ('Cropped Cardigan', 'TOP', 20, '#F2A7C3'),
  ('Ribbed Tank', 'TOP', 20, '#B7ACE0'),
  ('Denim Jacket', 'TOP', 20, '#8FB4D9'),
  ('Pleated Mini', 'BOTTOM', 10, '#F5E3B3'),
  ('Low-Rise Denim', 'BOTTOM', 10, '#A9C6E0'),
  ('Wide-Leg Trousers', 'BOTTOM', 10, '#D9B7A3'),
  ('Platform Mary Janes', 'SHOES', 5, '#F2A7C3'),
  ('White Sneakers', 'SHOES', 5, '#F5F3EE'),
  ('Ankle Boots', 'SHOES', 5, '#6B4A32'),
  ('Pearl Baguette Bag', 'ACCESSORY', 30, '#C9B6E8'),
  ('Butterfly Clips', 'ACCESSORY', 30, '#F2A7C3'),
  ('Star Sunglasses', 'ACCESSORY', 30, '#2B2118');
