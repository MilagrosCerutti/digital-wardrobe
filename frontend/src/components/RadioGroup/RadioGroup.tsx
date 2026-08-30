import { useId } from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name?: string;
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ name, label, options, value, onChange, className }: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      {label && <legend className="text-sm font-medium text-foreground">{label}</legend>}
      <div className="flex flex-col gap-1.5">
        {options.map((option) => {
          const optionId = `${groupName}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <input
                id={optionId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <label htmlFor={optionId} className="text-sm text-foreground">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
