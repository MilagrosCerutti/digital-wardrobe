import { FormalityLevel } from '@/types/clothingItem.types';

export interface CatalogEntry {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory extends CatalogEntry {
  categoryId: string;
}

export interface Color extends CatalogEntry {
  hex: string;
}

export interface Occasion extends CatalogEntry {
  formalityHint: FormalityLevel;
}

export interface Catalog {
  categories: CatalogEntry[];
  subcategories: Subcategory[];
  materials: CatalogEntry[];
  patterns: CatalogEntry[];
  colors: Color[];
  styles: CatalogEntry[];
  occasions: Occasion[];
}
