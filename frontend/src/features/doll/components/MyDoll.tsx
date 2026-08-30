import { DollCanvas } from '@/features/doll/components/DollCanvas';
import { DollControls } from '@/features/doll/components/DollControls';
import type { Doll, DollItem } from '@/features/doll/types/doll.types';

export interface MyDollProps {
  doll: Doll;
  equippedItems: DollItem[];
  items: DollItem[];
  onEquip: (item: DollItem) => void;
  onUnequip: (item: DollItem) => void;
  disabled?: boolean;
}

/**
 * The My Doll dress-up composition: the Master Doll is the focal point on
 * the left, the closet browses on the right -- a two-column fashion-game
 * layout, not a settings page. The doll column is `auto`-sized (not a flex
 * fraction) so it hugs the doll's own rendered width instead of stretching
 * empty space around her. On narrow screens the grid collapses to one
 * column and DOM order alone (doll first, closet second) puts her above
 * the closet -- no responsive order overrides needed since "doll first"
 * is what both the mobile stack and the desktop left position want.
 */
export function MyDoll({ doll, equippedItems, items, onEquip, onUnequip, disabled }: MyDollProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
      <DollCanvas
        doll={doll}
        equippedItems={equippedItems}
        className="mx-auto w-full max-w-md lg:h-[min(62vh,560px)] lg:w-auto lg:max-w-none"
      />

      <div className="dw-panel w-full bg-paper p-5">
        <span className="dw-micro">Doll Closet</span>
        <DollControls items={items} equippedItems={equippedItems} onEquip={onEquip} onUnequip={onUnequip} disabled={disabled} />
      </div>
    </div>
  );
}
