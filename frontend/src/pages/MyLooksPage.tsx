import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LookCard, OutfitDetailModal, useOutfitsQuery } from '@/features/myLooks';
import type { Outfit } from '@/features/myLooks';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { getApiErrorMessage } from '@/utils/apiError';

const TILTS = [-2, 1.5, -1, 2, -1.5, 1] as const;

export function MyLooksPage() {
  const navigate = useNavigate();
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const outfitsQuery = useOutfitsQuery();

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <span className="dw-micro text-primary">My Looks</span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Every outfit you've saved, kept in one place.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Revisit your saved looks, check their compatibility breakdown, or clear out the ones you've outgrown.
        </p>

        <div className="mt-8">
          {outfitsQuery.isLoading && (
            <div className="flex justify-center py-12">
              <Spinner label="Loading your looks" />
            </div>
          )}

          {outfitsQuery.isError && (
            <ErrorState
              title="Couldn't load your looks"
              description={getApiErrorMessage(outfitsQuery.error)}
              onRetry={() => outfitsQuery.refetch()}
            />
          )}

          {outfitsQuery.data && outfitsQuery.data.length === 0 && (
            <EmptyState
              title="No looks yet"
              description="No looks yet — time to style one."
              action={
                <Button type="button" onClick={() => navigate('/style-it')}>
                  Create a look
                </Button>
              }
            />
          )}

          {outfitsQuery.data && outfitsQuery.data.length > 0 && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {outfitsQuery.data.map((outfit, index) => (
                <LookCard
                  key={outfit.id}
                  outfit={outfit}
                  tilt={TILTS[index % TILTS.length]}
                  onClick={() => setSelectedOutfit(outfit)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <OutfitDetailModal outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} />
    </div>
  );
}
