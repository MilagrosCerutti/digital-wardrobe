import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('App', () => {
  it('renders the HomePage hero at the root route', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /your digital.*fashion.*world/i }),
    ).toBeInTheDocument();
  });

  it('renders primary navigation to the main app sections', () => {
    render(<App />);
    const header = within(screen.getByRole('banner'));

    expect(header.getByRole('link', { name: 'Closet' })).toHaveAttribute('href', '/closet');
    expect(header.getByRole('link', { name: 'My Doll' })).toHaveAttribute('href', '/doll');
  });
});
