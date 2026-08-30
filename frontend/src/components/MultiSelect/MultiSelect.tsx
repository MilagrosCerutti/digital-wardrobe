import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/Badge';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  // When the dropdown list (`options`) is scoped to a subset (e.g. filtered
  // by category), badges for values selected under a different scope would
  // otherwise vanish since they're no longer in `options`. Pass the full,
  // unscoped option list here to keep their labels resolvable regardless of
  // the current filter.
  allOptions?: MultiSelectOption[];
}

export function MultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder = 'Select…',
  className,
  allOptions,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      // Capture phase + stopPropagation: this dropdown closes without also
      // closing an ancestor Modal that has its own Escape-to-close listener.
      event.stopPropagation();
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen]);

  function toggleValue(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }

  const labelSource = allOptions ?? options;
  const selectedOptions = values
    .map((value) => labelSource.find((option) => option.value === value))
    .filter((option): option is MultiSelectOption => option !== undefined);

  return (
    <div className={cn('relative flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-10 w-full flex-wrap items-center gap-1 rounded-[var(--radius)] border border-input bg-card px-3 py-1.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        {selectedOptions.map((option) => (
          <Badge key={option.value} variant="accent">
            {option.label}
          </Badge>
        ))}
      </button>
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="dw-panel absolute top-full z-10 mt-1 max-h-56 w-full overflow-auto p-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleValue(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[var(--radius)] px-2 py-1.5 text-left text-sm hover:bg-muted',
                    isSelected && 'bg-accent text-accent-foreground',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
