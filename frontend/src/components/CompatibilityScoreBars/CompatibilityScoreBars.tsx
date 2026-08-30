export interface CompatibilityBreakdown {
  formalityScore: number;
  colorScore: number;
  styleScore: number;
}

export interface CompatibilityScoreBarsProps {
  score: number;
  breakdown: CompatibilityBreakdown;
}

const BREAKDOWN_LABELS: { key: keyof CompatibilityBreakdown; label: string }[] = [
  { key: 'formalityScore', label: 'Formality' },
  { key: 'colorScore', label: 'Color' },
  { key: 'styleScore', label: 'Style' },
];

export function CompatibilityScoreBars({ score, breakdown }: CompatibilityScoreBarsProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="dw-micro">Compatibility</span>
        <span className="dw-hand text-2xl text-primary">{score}%</span>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {BREAKDOWN_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="dw-micro w-20 shrink-0">{label}</span>
            <div className="h-1.5 flex-1 rounded-full bg-border">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${breakdown[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
