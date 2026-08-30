export {
  useCatalogQuery,
  useClosetItemsQuery,
  useFavoriteClothingItemMutation,
  useUnfavoriteClothingItemMutation,
} from './hooks/useCloset';
export { ClosetFilters } from './components/ClosetFilters';
export { ClothingItemGrid } from './components/ClothingItemGrid';
export { AddClothingItemModal } from './components/AddClothingItemModal';
export { ClothingItemDetailModal } from './components/ClothingItemDetailModal';
export type {
  Catalog,
  ClosetFilters as ClosetFiltersValue,
  ClothingItem,
  Color,
  FormalityLevel,
  Occasion,
} from './types/closet.types';
