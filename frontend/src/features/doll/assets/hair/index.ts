import { HairLong } from '@/features/doll/assets/hair/HairLong';
import { HairShort } from '@/features/doll/assets/hair/HairShort';
import { HairPonytail } from '@/features/doll/assets/hair/HairPonytail';
import { HairBun } from '@/features/doll/assets/hair/HairBun';
import type { HairStyle } from '@/features/doll/types/doll.types';
import type { ComponentType } from 'react';
import type { HairProps } from '@/features/doll/assets/hair/HairLong';

export const HAIR_STYLE_COMPONENTS: Record<HairStyle, ComponentType<HairProps>> = {
  LONG: HairLong,
  SHORT: HairShort,
  PONYTAIL: HairPonytail,
  BUN: HairBun,
};

export type { HairProps };
