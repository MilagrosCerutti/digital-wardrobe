import { NavLink } from 'react-router-dom';
import { Logo } from '@/layouts/Logo';

const FOOTER_LINKS = [
  { to: '/closet', label: 'Closet' },
  { to: '/inspire-me', label: 'Inspire Me' },
  { to: '/style-it', label: 'Style It' },
  { to: '/my-looks', label: 'My Looks' },
  { to: '/doll', label: 'My Doll' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-paper px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="dw-micro text-muted-foreground hover:text-primary"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <span className="dw-micro">a little fashion universe inside your computer</span>
          <span className="dw-micro">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
