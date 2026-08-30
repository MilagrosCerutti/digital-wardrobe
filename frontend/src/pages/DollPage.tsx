import {
  MyDoll,
  useDollItemsQuery,
  useDollProfileQuery,
  useEquipDollItemMutation,
  useUnequipDollItemMutation,
} from '@/features/doll';
import type { DollItem } from '@/features/doll';
import { isApprovedDollItemAsset } from '@/features/doll/assets/wardrobeRaster';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function DollPage() {
  const profileQuery = useDollProfileQuery();
  const itemsQuery = useDollItemsQuery();
  const equip = useEquipDollItemMutation();
  const unequip = useUnequipDollItemMutation();
  const { toast } = useToast();

  if (profileQuery.isLoading || itemsQuery.isLoading) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Spinner label="Loading your doll" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="px-5 py-16 sm:px-8">
        <ErrorState
          title="Couldn't load your doll"
          description={getApiErrorMessage(profileQuery.error)}
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  if (itemsQuery.isError || !itemsQuery.data) {
    return (
      <div className="px-5 py-16 sm:px-8">
        <ErrorState
          title="Couldn't load the wardrobe"
          description={getApiErrorMessage(itemsQuery.error)}
          onRetry={() => itemsQuery.refetch()}
        />
      </div>
    );
  }

  const { doll, equippedItems } = profileQuery.data;
  const approvedItems = itemsQuery.data.filter((item) => isApprovedDollItemAsset(item.assetUrl));
  const isMutating = equip.isPending || unequip.isPending;

  function handleEquip(item: DollItem) {
    equip.mutate(item.id, {
      onError: (error) => toast({ title: 'Could not equip item', description: getApiErrorMessage(error), variant: 'error' }),
    });
  }

  function handleUnequip(item: DollItem) {
    unequip.mutate(item.id, {
      onError: (error) => toast({ title: 'Could not unequip item', description: getApiErrorMessage(error), variant: 'error' }),
    });
  }

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <span className="dw-micro text-primary">My Doll</span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Meet your digital fashion self.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Dress her with pieces from your closet.</p>

        <div className="mt-8">
          <MyDoll
            doll={doll}
            equippedItems={equippedItems}
            items={approvedItems}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
            disabled={isMutating}
          />
        </div>
      </div>
    </div>
  );
}
