import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      <span className="size-2 shrink-0 rotate-45 bg-primary" aria-hidden="true" />
      <span className="truncate text-[0.8rem] tracking-[0.22em] text-foreground uppercase">
        Digital Wardrobe
      </span>
    </Link>
  );
}
