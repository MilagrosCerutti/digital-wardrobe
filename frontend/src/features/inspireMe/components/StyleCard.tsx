import { Badge } from '@/components/Badge';
import type { StyleCard as StyleCardType } from '@/features/inspireMe/types/inspireMe.types';

export interface StyleCardProps {
  styleCard: StyleCardType;
}

export function StyleCard({ styleCard }: StyleCardProps) {
  return (
    <div className="dw-panel relative bg-cream p-5">
      <span className="dw-tape absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />
      <span className="dw-micro text-primary">Your Style Card</span>
      <h2 className="dw-hand mt-1 text-3xl text-foreground">{styleCard.vibeName}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{styleCard.description}</p>

      {styleCard.colorPalette.length > 0 && (
        <div className="mt-4">
          <span className="dw-micro">Palette</span>
          <div className="mt-1.5 flex gap-1.5">
            {styleCard.colorPalette.map((color) => (
              <span
                key={color.id}
                title={color.name}
                className="size-6 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {styleCard.keyPieces.length > 0 && (
        <div className="mt-3">
          <span className="dw-micro">Key pieces</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {styleCard.keyPieces.map((piece) => (
              <Badge key={piece} variant="outline">
                {piece}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {styleCard.characteristics.length > 0 && (
        <div className="mt-3">
          <span className="dw-micro">Characteristics</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {styleCard.characteristics.map((characteristic) => (
              <Badge key={characteristic} variant="outline">
                {characteristic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="dw-micro mt-4 text-primary">
        {styleCard.outfitCount} {styleCard.outfitCount === 1 ? 'look' : 'looks'} generated
      </p>
    </div>
  );
}
