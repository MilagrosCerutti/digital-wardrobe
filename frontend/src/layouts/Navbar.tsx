import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Logo } from '@/layouts/Logo';
import { useAuth } from '@/features/auth/context/AuthContext';

const NAV_LINKS = [
  { to: '/closet', label: 'Closet' },
  { to: '/inspire-me', label: 'Inspire Me' },
  { to: '/style-it', label: 'Style It' },
  { to: '/my-looks', label: 'My Looks' },
  { to: '/doll', label: 'My Doll' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navLinks = user?.role === 'ADMIN' ? [...NAV_LINKS, { to: '/admin', label: 'Admin' }] : NAV_LINKS;

  // No explicit navigate() here: on protected pages, ProtectedRoute's own
  // isAuthenticated check already redirects to /login once logout() takes
  // effect. Adding a second navigation here previously raced that redirect
  // (see Phase 12 cross-feature review).
  function handleLogout() {
    logout();
    setIsMenuOpen(false);
  }

  return (
    <header className="dw-chrome sticky top-0 z-40 border-b border-border backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Logo />
        <nav className="hidden justify-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'dw-micro relative py-1 transition-colors hover:text-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className="dw-micro hidden text-foreground hover:text-primary sm:inline"
              >
                {user?.firstName}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center justify-center gap-2 border border-border px-4 py-2 text-xs font-semibold tracking-wide text-foreground uppercase hover:bg-muted sm:inline-flex"
              >
                Log Out
              </button>
            </>
          ) : (
            <NavLink
              to="/register"
              className="dw-lift hidden items-center justify-center gap-2 border border-primary bg-primary px-4 py-2 text-xs font-semibold tracking-wide text-primary-foreground uppercase sm:inline-flex"
            >
              Enter the Wardrobe
              <span aria-hidden="true">→</span>
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            className="dw-micro border border-border bg-paper px-3 py-2 lg:hidden"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav id="mobile-nav" className="border-t border-border lg:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className="dw-micro block border-b border-border px-5 py-3 text-muted-foreground"
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="dw-micro block border-b border-border px-5 py-3 text-muted-foreground"
              >
                Profile & Settings
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full border-t border-border px-5 py-3 text-left text-xs font-semibold tracking-wide text-foreground uppercase"
              >
                Log Out
              </button>
            </>
          ) : (
            <NavLink
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="block bg-primary px-5 py-3 text-center text-xs font-semibold tracking-wide text-primary-foreground uppercase"
            >
              Enter the Wardrobe
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
