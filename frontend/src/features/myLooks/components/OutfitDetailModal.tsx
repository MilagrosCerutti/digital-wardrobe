import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CompatibilityScoreBars } from '@/components/CompatibilityScoreBars';
import { useToast } from '@/components/Toast';
import { useDeleteOutfitMutation } from '@/features/myLooks/hooks/useMyLooks';
import type { Mood, Outfit } from '@/features/myLooks/types/myLooks.types';
import { getApiErrorMessage } from '@/utils/apiError';

const MOOD_LABELS: Record<Mood, string> = {
  CONFIDENT: 'Confident',
  RELAXED: 'Relaxed',
  PLAYFUL: 'Playful',
  ROMANTIC: 'Romantic',
  COZY: 'Cozy',
  BOLD: 'Bold',
};

export interface OutfitDetailModalProps {
  outfit: Outfit | null;
  onClose: () => void;
}

export function OutfitDetailModal({ outfit, onClose }: OutfitDetailModalProps) {
  const deleteOutfit = useDeleteOutfitMutation();
  const { toast } = useToast();

  if (!outfit) return null;

  async function handleDelete() {
    if (!outfit) return;
    try {
      await deleteOutfit.mutateAsync(outfit.id);
      toast({ title: 'Look deleted', variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not delete this look', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  return (
    <Modal isOpen={Boolean(outfit)} onClose={onClose} title={outfit.name ?? 'Untitled look'}>
      <div className="flex flex-col gap-4">
        {(outfit.source === 'GENERATED' || outfit.occasion || outfit.mood) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {outfit.source === 'GENERATED' && <Badge variant="outline">Generated</Badge>}
            {outfit.occasion && <Badge variant="outline">{outfit.occasion.name}</Badge>}
            {outfit.mood && <Badge variant="outline">{MOOD_LABELS[outfit.mood]}</Badge>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {outfit.items.map((item) => (
            <div key={item.id} className="dw-panel aspect-square overflow-hidden bg-cream">
              <img
                src={item.imageUrl}
                alt={`${item.subcategory.name} in ${item.category.name}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {outfit.items.map((item) => (
            <Badge key={item.id} variant="outline">
              {item.subcategory.name}
            </Badge>
          ))}
        </div>

        <div className="dw-panel bg-cream p-3">
          <CompatibilityScoreBars
            score={outfit.compatibilityScore}
            breakdown={outfit.compatibilityBreakdown}
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteOutfit.isPending}
          >
            {deleteOutfit.isPending ? 'Deleting…' : 'Delete Look'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
