import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StyleCard } from './StyleCard';
import type { StyleCard as StyleCardType } from '@/features/inspireMe/types/inspireMe.types';

function buildStyleCard(overrides: Partial<StyleCardType> = {}): StyleCardType {
  return {
    vibeName: 'Cozy Work',
    description: 'A cozy take on work, pulled straight from your own closet.',
    colorPalette: [{ id: 'color-1', name: 'Pink', hex: '#F2A7C3', isActive: true, createdAt: '', updatedAt: '' }],
    keyPieces: ['Blouse'],
    characteristics: ['Mostly Casual', 'Boho'],
    outfitCount: 2,
    ...overrides,
  };
}

describe('StyleCard', () => {
  it('renders the vibe name, description, and outfit count', () => {
    render(<StyleCard styleCard={buildStyleCard()} />);

    expect(screen.getByText('Cozy Work')).toBeInTheDocument();
    expect(screen.getByText('A cozy take on work, pulled straight from your own closet.')).toBeInTheDocument();
    expect(screen.getByText('2 looks generated')).toBeInTheDocument();
  });

  it('renders the color palette, key pieces, and characteristics', () => {
    render(<StyleCard styleCard={buildStyleCard()} />);

    expect(screen.getByTitle('Pink')).toBeInTheDocument();
    expect(screen.getByText('Blouse')).toBeInTheDocument();
    expect(screen.getByText('Mostly Casual')).toBeInTheDocument();
    expect(screen.getByText('Boho')).toBeInTheDocument();
  });

  it('omits empty sections gracefully', () => {
    render(<StyleCard styleCard={buildStyleCard({ colorPalette: [], keyPieces: [], characteristics: [] })} />);

    expect(screen.queryByText('Palette')).not.toBeInTheDocument();
    expect(screen.queryByText('Key pieces')).not.toBeInTheDocument();
    expect(screen.queryByText('Characteristics')).not.toBeInTheDocument();
  });

  it('uses singular wording for a single generated look', () => {
    render(<StyleCard styleCard={buildStyleCard({ outfitCount: 1 })} />);

    expect(screen.getByText('1 look generated')).toBeInTheDocument();
  });
});
