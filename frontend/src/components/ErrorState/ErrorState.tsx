import { cn } from '@/utils/cn';
import { Button } from '@/components/Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'dw-panel flex flex-col items-center gap-2 border-destructive/40 px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}
