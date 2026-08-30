import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecommendationCard } from './RecommendationCard';
import type { Recommendation } from '@/features/inspireMe/types/inspireMe.types';

function buildRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    items: [
      {
        id: 'item-1',
        userId: 'user-1',
        imageUrl: 'https://example.com/item-1.png',
        category: { id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
        subcategory: { id: 'sub-1', name: 'T-Shirt', isActive: true, createdAt: '', updatedAt: '' },
        material: { id: 'mat-1', name: 'Cotton', isActive: true, createdAt: '', updatedAt: '' },
        pattern: { id: 'pat-1', name: 'Solid', isActive: true, createdAt: '', updatedAt: '' },
        colors: [],
        styles: [],
        fit: 'REGULAR',
        formalityLevel: 'CASUAL',
        isArchived: false,
        isFavorite: false,
        createdAt: '',
        updatedAt: '',
      },
    ],
    compatibilityScore: 90,
    compatibilityBreakdown: { formalityScore: 100, colorScore: 80, styleScore: 90 },
    explanation: ['You asked for a Cozy mood for Work.', 'Formality compatibility: 100%'],
    ...overrides,
  };
}

describe('RecommendationCard', () => {
  it('shows the items, compatibility score, and explanation', () => {
    render(
      <RecommendationCard recommendation={buildRecommendation()} onSave={vi.fn()} isSaving={false} isSaved={false} />,
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('You asked for a Cozy mood for Work.')).toBeInTheDocument();
  });

  it('calls onSave when the button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<RecommendationCard recommendation={buildRecommendation()} onSave={onSave} isSaving={false} isSaved={false} />);

    await user.click(screen.getByRole('button', { name: 'Save to My Looks' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled Saved state once saved', () => {
    render(<RecommendationCard recommendation={buildRecommendation()} onSave={vi.fn()} isSaving={false} isSaved />);

    const button = screen.getByRole('button', { name: 'Saved' });
    expect(button).toBeDisabled();
  });

  it('shows a saving state while the mutation is pending', () => {
    render(<RecommendationCard recommendation={buildRecommendation()} onSave={vi.fn()} isSaving isSaved={false} />);

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
