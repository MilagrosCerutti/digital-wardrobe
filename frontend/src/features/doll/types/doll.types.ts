export type BodyType = 'SLIM' | 'AVERAGE' | 'CURVY';
export type SkinTone = 'PORCELAIN' | 'LIGHT' | 'MEDIUM' | 'TAN' | 'DEEP';
export type HairStyle = 'LONG' | 'SHORT' | 'PONYTAIL' | 'BUN';
export type HairColor = 'BLONDE' | 'BROWN' | 'BLACK' | 'RED' | 'PASTEL_PINK' | 'PASTEL_LILAC';
export type EyeColor = 'BROWN' | 'BLUE' | 'GREEN' | 'HAZEL';
export type DollItemCategory = 'TOP' | 'BOTTOM' | 'DRESS' | 'SHOES' | 'ACCESSORY';

export interface Doll {
  id: string;
  userId: string;
  bodyType: BodyType;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  eyeColor: EyeColor;
  createdAt: string;
  updatedAt: string;
}

export interface DollItem {
  id: string;
  name: string;
  category: DollItemCategory;
  layer: number;
  /** Key identifying which illustrated garment component renders this item (see assets/wardrobe.ts). */
  assetUrl: string;
  /** The color this specific catalog row/variant renders in. */
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DollProfile {
  doll: Doll;
  equippedItems: DollItem[];
}

export interface UpdateDollAppearancePayload {
  bodyType?: BodyType;
  skinTone?: SkinTone;
  hairStyle?: HairStyle;
  hairColor?: HairColor;
  eyeColor?: EyeColor;
}
