import { Button } from '@/components/Button';
import { CompatibilityScoreBars } from '@/components/CompatibilityScoreBars';
import type { Recommendation } from '@/features/inspireMe/types/inspireMe.types';

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function RecommendationCard({ recommendation, onSave, isSaving, isSaved }: RecommendationCardProps) {
  return (
    <div className="dw-panel dw-lift flex flex-col gap-4 bg-paper p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {recommendation.items.map((item) => (
          <div key={item.id} className="aspect-square overflow-hidden rounded-[var(--radius)] bg-cream">
            <img
              src={item.imageUrl}
              alt={`${item.subcategory.name} in ${item.category.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <CompatibilityScoreBars
        score={recommendation.compatibilityScore}
        breakdown={recommendation.compatibilityBreakdown}
      />

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {recommendation.explanation.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <Button type="button" onClick={onSave} disabled={isSaving || isSaved} className="self-start">
        {isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save to My Looks'}
      </Button>
    </div>
  );
}
