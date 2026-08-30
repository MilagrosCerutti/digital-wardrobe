import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DollItemManager } from './DollItemManager';
import { ToastProvider } from '@/components/Toast';
import * as adminService from '@/features/admin/services/adminService';
import type { DollItem } from '@/features/admin/types/admin.types';

vi.mock('@/features/admin/services/adminService');
const mockedAdminService = vi.mocked(adminService);

afterEach(() => {
  vi.clearAllMocks();
});

function buildDollItem(overrides: Partial<DollItem> = {}): DollItem {
  return {
    id: 'doll-item-1',
    name: 'Red Hat',
    category: 'ACCESSORY',
    layer: 3,
    assetUrl: 'accessory-bag',
    color: '#F2A7C3',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderDollItemManager() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DollItemManager />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('DollItemManager', () => {
  it('lists doll items with their category, layer, and status', async () => {
    mockedAdminService.fetchDollItems.mockResolvedValue([buildDollItem()]);

    renderDollItemManager();

    expect(await screen.findByText('Red Hat')).toBeInTheDocument();
    expect(screen.getByText('ACCESSORY')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('creates a doll item from a curated garment and color', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchDollItems.mockResolvedValue([]);
    mockedAdminService.createDollItem.mockResolvedValue(buildDollItem());

    renderDollItemManager();
    await screen.findByText('No doll items yet.');

    await user.type(screen.getByLabelText('Name'), 'Red Hat');
    await user.selectOptions(screen.getByLabelText('Category'), 'ACCESSORY');
    await user.clear(screen.getByLabelText('Layer'));
    await user.type(screen.getByLabelText('Layer'), '3');
    await user.selectOptions(screen.getByLabelText('Garment'), 'accessory-bag');
    await user.selectOptions(screen.getByLabelText('Color'), '#F2A7C3');
    await user.click(screen.getByRole('button', { name: 'Add Doll Item' }));

    expect(mockedAdminService.createDollItem.mock.calls[0]?.[0]).toEqual({
      name: 'Red Hat',
      category: 'ACCESSORY',
      layer: 3,
      assetUrl: 'accessory-bag',
      color: '#F2A7C3',
    });
    expect(await screen.findByText('Doll item created')).toBeInTheDocument();
  });

  it('edits a doll item via the modal', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchDollItems.mockResolvedValue([buildDollItem()]);
    mockedAdminService.updateDollItem.mockResolvedValue(buildDollItem({ layer: 5 }));

    renderDollItemManager();
    await screen.findByText('Red Hat');

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const dialog = screen.getByRole('dialog');
    const layerInput = within(dialog).getByLabelText('Layer');
    await user.clear(layerInput);
    await user.type(layerInput, '5');
    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    expect(mockedAdminService.updateDollItem).toHaveBeenCalledWith('doll-item-1', {
      name: 'Red Hat',
      category: 'ACCESSORY',
      layer: 5,
      assetUrl: 'accessory-bag',
      color: '#F2A7C3',
    });
    expect(await screen.findByText('Doll item updated')).toBeInTheDocument();
  });

  it('deactivates a doll item', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchDollItems.mockResolvedValue([buildDollItem()]);
    mockedAdminService.deactivateDollItem.mockResolvedValue(undefined);

    renderDollItemManager();
    await screen.findByText('Red Hat');

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(mockedAdminService.deactivateDollItem).toHaveBeenCalledWith('doll-item-1');
    expect(await screen.findByText('Doll item deactivated')).toBeInTheDocument();
  });
});
