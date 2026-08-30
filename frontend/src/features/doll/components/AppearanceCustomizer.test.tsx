import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppearanceCustomizer } from './AppearanceCustomizer';
import type { Doll } from '@/features/doll/types/doll.types';

const DOLL: Doll = {
  id: 'doll-1',
  userId: 'user-1',
  bodyType: 'AVERAGE',
  skinTone: 'MEDIUM',
  hairStyle: 'LONG',
  hairColor: 'BROWN',
  eyeColor: 'BROWN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AppearanceCustomizer', () => {
  it('calls onChange with the selected body type', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AppearanceCustomizer doll={DOLL} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Curvy' }));

    expect(onChange).toHaveBeenCalledWith({ bodyType: 'CURVY' });
  });

  it('calls onChange with the selected hair color', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AppearanceCustomizer doll={DOLL} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Pastel Pink' }));

    expect(onChange).toHaveBeenCalledWith({ hairColor: 'PASTEL_PINK' });
  });

  it('marks the current values as pressed', () => {
    render(<AppearanceCustomizer doll={DOLL} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Average' })).toHaveAttribute('aria-pressed', 'true');
    // "Brown" is shared by both the hair color and eye color rows, and the
    // doll is Brown/Brown, so every "Brown" swatch should read as pressed.
    for (const brownButton of screen.getAllByRole('button', { name: 'Brown' })) {
      expect(brownButton).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('disables all controls while a mutation is pending', () => {
    render(<AppearanceCustomizer doll={DOLL} onChange={vi.fn()} disabled />);

    expect(screen.getByRole('button', { name: 'Curvy' })).toBeDisabled();
  });
});
