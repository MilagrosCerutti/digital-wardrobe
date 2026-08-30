import type { AuthUser } from '@/features/auth/types/auth.types';
import type { CatalogEntry, Color, FormalityLevel, Occasion, Subcategory } from '@/features/closet/types/closet.types';
import type { DollItem, DollItemCategory } from '@/features/doll/types/doll.types';

export type { CatalogEntry, Color, DollItem, DollItemCategory, FormalityLevel, Occasion, Subcategory };
export type AdminUser = AuthUser;

export type CatalogType =
  | 'categories'
  | 'subcategories'
  | 'materials'
  | 'patterns'
  | 'colors'
  | 'styles'
  | 'occasions';

export interface AdminCatalog {
  categories: CatalogEntry[];
  subcategories: Subcategory[];
  materials: CatalogEntry[];
  patterns: CatalogEntry[];
  colors: Color[];
  styles: CatalogEntry[];
  occasions: Occasion[];
}

export type CreateCatalogEntryPayload =
  | { type: 'categories' | 'materials' | 'patterns' | 'styles'; name: string }
  | { type: 'subcategories'; name: string; categoryId: string }
  | { type: 'colors'; name: string; hex: string }
  | { type: 'occasions'; name: string; formalityHint: FormalityLevel };

export interface CreateDollItemPayload {
  name: string;
  category: DollItemCategory;
  layer: number;
  assetUrl: string;
  color: string;
}

export type UpdateDollItemPayload = Partial<CreateDollItemPayload>;
