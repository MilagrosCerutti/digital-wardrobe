import {
  BODY_TYPE_OPTIONS,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '@/features/doll/constants';
import type { Doll, UpdateDollAppearancePayload } from '@/features/doll/types/doll.types';
import { cn } from '@/utils/cn';

export interface AppearanceCustomizerProps {
  doll: Doll;
  onChange: (patch: UpdateDollAppearancePayload) => void;
  disabled?: boolean;
}

function ChipRow<Value extends string>({
  label,
  options,
  value,
  onSelect,
  disabled,
}: {
  label: string;
  options: { value: Value; label: string }[];
  value: Value;
  onSelect: (value: Value) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="dw-micro">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            aria-pressed={option.value === value}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50',
              option.value === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwatchRow<Value extends string>({
  label,
  options,
  value,
  onSelect,
  disabled,
}: {
  label: string;
  options: { value: Value; label: string; hex: string }[];
  value: Value;
  onSelect: (value: Value) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="dw-micro">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            aria-pressed={option.value === value}
            aria-label={option.label}
            title={option.label}
            style={{ backgroundColor: option.hex }}
            className={cn(
              'size-8 rounded-full border-2 transition-transform disabled:opacity-50',
              option.value === value
                ? 'scale-110 border-primary'
                : 'border-border hover:scale-105',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function AppearanceCustomizer({ doll, onChange, disabled }: AppearanceCustomizerProps) {
  return (
    <div className="dw-panel flex flex-col gap-5 bg-paper p-5">
      <ChipRow
        label="Body type"
        options={BODY_TYPE_OPTIONS}
        value={doll.bodyType}
        onSelect={(bodyType) => onChange({ bodyType })}
        disabled={disabled}
      />
      <SwatchRow
        label="Skin tone"
        options={SKIN_TONE_OPTIONS}
        value={doll.skinTone}
        onSelect={(skinTone) => onChange({ skinTone })}
        disabled={disabled}
      />
      <ChipRow
        label="Hair style"
        options={HAIR_STYLE_OPTIONS}
        value={doll.hairStyle}
        onSelect={(hairStyle) => onChange({ hairStyle })}
        disabled={disabled}
      />
      <SwatchRow
        label="Hair color"
        options={HAIR_COLOR_OPTIONS}
        value={doll.hairColor}
        onSelect={(hairColor) => onChange({ hairColor })}
        disabled={disabled}
      />
      <SwatchRow
        label="Eye color"
        options={EYE_COLOR_OPTIONS}
        value={doll.eyeColor}
        onSelect={(eyeColor) => onChange({ eyeColor })}
        disabled={disabled}
      />
    </div>
  );
}
