import { CatalogEntry, Color } from '@/types/catalog.types';

export type Fit = 'SLIM' | 'REGULAR' | 'OVERSIZED' | 'RELAXED';
export type FormalityLevel = 'CASUAL' | 'SMART_CASUAL' | 'FORMAL' | 'VERY_FORMAL';

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

export interface CreateClothingItemInput {
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

export interface UpdateClothingItemInput {
  imageUrl?: string | undefined;
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  materialId?: string | undefined;
  patternId?: string | undefined;
  colorIds?: string[] | undefined;
  styleIds?: string[] | undefined;
  fit?: Fit | undefined;
  formalityLevel?: FormalityLevel | undefined;
}

export interface ClosetFilters {
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  materialId?: string | undefined;
  patternId?: string | undefined;
  colorId?: string | undefined;
  styleId?: string | undefined;
  fit?: Fit | undefined;
  formalityLevel?: FormalityLevel | undefined;
  includeArchived?: boolean | undefined;
  favoritesOnly?: boolean | undefined;
}
