insert into categories (name) values
  ('Tops'), ('Bottoms'), ('Dresses'), ('Outerwear'), ('Shoes'), ('Accessories');

insert into subcategories (category_id, name)
select c.id, v.subcategory_name
from categories c
join (values
  ('Tops', 'T-Shirt'), ('Tops', 'Blouse'), ('Tops', 'Tank Top'),
  ('Tops', 'Sweater'), ('Tops', 'Cardigan'), ('Tops', 'Shirt'),
  ('Bottoms', 'Jeans'), ('Bottoms', 'Skirt'), ('Bottoms', 'Shorts'),
  ('Bottoms', 'Trousers'), ('Bottoms', 'Leggings'),
  ('Dresses', 'Mini Dress'), ('Dresses', 'Midi Dress'),
  ('Dresses', 'Maxi Dress'), ('Dresses', 'Slip Dress'),
  ('Outerwear', 'Jacket'), ('Outerwear', 'Coat'),
  ('Outerwear', 'Blazer'), ('Outerwear', 'Vest'),
  ('Shoes', 'Sneakers'), ('Shoes', 'Heels'), ('Shoes', 'Boots'),
  ('Shoes', 'Sandals'), ('Shoes', 'Flats'),
  ('Accessories', 'Bag'), ('Accessories', 'Jewelry'), ('Accessories', 'Hat'),
  ('Accessories', 'Scarf'), ('Accessories', 'Belt'), ('Accessories', 'Sunglasses')
) as v(category_name, subcategory_name) on v.category_name = c.name;

insert into materials (name) values
  ('Cotton'), ('Denim'), ('Silk'), ('Wool'), ('Leather'),
  ('Linen'), ('Polyester'), ('Knit');

insert into patterns (name) values
  ('Solid'), ('Striped'), ('Floral'), ('Polka Dot'),
  ('Plaid'), ('Animal Print'), ('Graphic');

insert into colors (name, hex) values
  ('Black', '#2B2118'), ('White', '#F5F3EE'), ('Cream', '#F5E3B3'),
  ('Pink', '#F2A7C3'), ('Red', '#B5523A'), ('Blue', '#8FB4D9'),
  ('Lilac', '#B7ACE0'), ('Lavender', '#C9B6E8'), ('Green', '#6FA87E'),
  ('Yellow', '#E8C27E'), ('Brown', '#6B4A32'), ('Beige', '#D9B7A3'),
  ('Gray', '#A9A29B');

insert into styles (name) values
  ('Casual'), ('Formal'), ('Streetwear'), ('Y2K'), ('Romantic'),
  ('Minimalist'), ('Preppy'), ('Grunge'), ('Boho');
