import * as catalogRepository from '@/repositories/catalog.repository';
import { Catalog } from '@/types/catalog.types';

export async function getFullCatalog(): Promise<Catalog> {
  return catalogRepository.findFullCatalog();
}
