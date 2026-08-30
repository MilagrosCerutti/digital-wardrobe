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

export type FormalityLevel = 'CASUAL' | 'SMART_CASUAL' | 'FORMAL' | 'VERY_FORMAL';

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

export type Fit = 'SLIM' | 'REGULAR' | 'OVERSIZED' | 'RELAXED';

export interface ClothingItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: CatalogEntry;
  subcategory: CatalogEntry;
  material: CatalogEntry;
  pattern: CatalogEntry;
  colors: Color[];
  styles: CatalogEntry[];
  fit: Fit | null;
  formalityLevel: FormalityLevel;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClothingItemPayload {
  imageUrl: string;
  categoryId: string;
  subcategoryId: string;
  materialId: string;
  patternId: string;
  colorIds: string[];
  styleIds: string[];
  fit?: Fit | undefined;
  formalityLevel: FormalityLevel;
}

export type UpdateClothingItemPayload = Partial<CreateClothingItemPayload>;

export interface ClosetFilters {
  categoryId?: string;
  subcategoryId?: string;
  materialId?: string;
  patternId?: string;
  colorId?: string;
  styleId?: string;
  fit?: Fit;
  formalityLevel?: FormalityLevel;
  includeArchived?: boolean;
  favoritesOnly?: boolean;
}
