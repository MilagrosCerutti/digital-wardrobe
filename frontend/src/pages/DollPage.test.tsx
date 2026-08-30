import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { DollPage } from './DollPage';
import { ToastProvider } from '@/components/Toast';
import * as dollService from '@/features/doll/services/dollService';
import type { Doll, DollItem } from '@/features/doll/types/doll.types';

vi.mock('@/features/doll/services/dollService');
const mockedDollService = vi.mocked(dollService);

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

const TANK: DollItem = {
  id: 'item-1',
  name: 'Cream Tank',
  category: 'TOP',
  layer: 20,
  assetUrl: 'top-tank',
  color: '#FCEEE3',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderDollPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DollPage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('DollPage', () => {
  it('shows a loading state while the doll profile is being fetched', () => {
    mockedDollService.fetchDollProfile.mockReturnValue(new Promise(() => {}));
    mockedDollService.fetchDollItems.mockResolvedValue([]);

    renderDollPage();

    expect(screen.getByText('Loading your doll')).toBeInTheDocument();
  });

  it('shows an error state with retry when the doll profile fails to load', async () => {
    mockedDollService.fetchDollProfile.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'This user does not have a doll yet.' } },
    });
    mockedDollService.fetchDollItems.mockResolvedValue([]);

    renderDollPage();

    expect(await screen.findByText("Couldn't load your doll")).toBeInTheDocument();
    expect(screen.getByText('This user does not have a doll yet.')).toBeInTheDocument();
  });

  it('renders the doll and catalog once loaded, and equips an item on click', async () => {
    const user = userEvent.setup();
    mockedDollService.fetchDollProfile.mockResolvedValue({ doll: DOLL, equippedItems: [] });
    mockedDollService.fetchDollItems.mockResolvedValue([TANK]);
    mockedDollService.equipDollItem.mockResolvedValue({ doll: DOLL, equippedItems: [TANK] });

    renderDollPage();

    expect(await screen.findByText('Cream Tank')).toBeInTheDocument();
    const itemButton = screen.getByRole('button', { name: /Cream Tank/ });
    expect(itemButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(itemButton);

    await waitFor(() => expect(itemButton).toHaveAttribute('aria-pressed', 'true'));
    expect(mockedDollService.equipDollItem.mock.calls[0]?.[0]).toBe('item-1');
  });

  it('shows a toast when equipping an item fails', async () => {
    const user = userEvent.setup();
    mockedDollService.fetchDollProfile.mockResolvedValue({ doll: DOLL, equippedItems: [] });
    mockedDollService.fetchDollItems.mockResolvedValue([TANK]);
    mockedDollService.equipDollItem.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'This doll item is not available.' } },
    });

    renderDollPage();

    const itemButton = await screen.findByRole('button', { name: /Cream Tank/ });
    await user.click(itemButton);

    expect(await screen.findByText('Could not equip item')).toBeInTheDocument();
    expect(screen.getByText('This doll item is not available.')).toBeInTheDocument();
  });
});
