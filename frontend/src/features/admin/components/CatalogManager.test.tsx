import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogManager } from './CatalogManager';
import { ToastProvider } from '@/components/Toast';
import * as adminService from '@/features/admin/services/adminService';
import type { AdminCatalog } from '@/features/admin/types/admin.types';

vi.mock('@/features/admin/services/adminService');
const mockedAdminService = vi.mocked(adminService);

afterEach(() => {
  vi.clearAllMocks();
});

function buildCatalog(overrides: Partial<AdminCatalog> = {}): AdminCatalog {
  return {
    categories: [{ id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' }],
    subcategories: [],
    materials: [],
    patterns: [],
    colors: [],
    styles: [],
    occasions: [],
    ...overrides,
  };
}

function renderCatalogManager() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CatalogManager />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('CatalogManager', () => {
  it('lists entries for the default catalog type and shows their active state', async () => {
    mockedAdminService.fetchAdminCatalog.mockResolvedValue(
      buildCatalog({
        categories: [
          { id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' },
          { id: 'cat-2', name: 'Retired', isActive: false, createdAt: '', updatedAt: '' },
        ],
      }),
    );

    renderCatalogManager();

    expect(await screen.findByText('Tops')).toBeInTheDocument();
    expect(screen.getByText('Retired')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('creates a simple entry (category)', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchAdminCatalog.mockResolvedValue(buildCatalog());
    mockedAdminService.createCatalogEntry.mockResolvedValue({
      id: 'cat-2',
      name: 'Swimwear',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    renderCatalogManager();
    await screen.findByText('Tops');

    await user.type(screen.getByLabelText('Name'), 'Swimwear');
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(mockedAdminService.createCatalogEntry.mock.calls[0]?.[0]).toEqual({
      type: 'categories',
      name: 'Swimwear',
    });
    expect(await screen.findByText('Entry created')).toBeInTheDocument();
  });

  it('shows a parent-category select and requires it for Subcategories', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchAdminCatalog.mockResolvedValue(buildCatalog());

    renderCatalogManager();
    await screen.findByText('Tops');

    await user.selectOptions(screen.getByLabelText('Catalog type'), 'subcategories');

    expect(screen.getByLabelText('Parent category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeDisabled();
  });

  it('shows a hex input for Colors and creates one', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchAdminCatalog.mockResolvedValue(buildCatalog());
    mockedAdminService.createCatalogEntry.mockResolvedValue({
      id: 'color-1',
      name: 'Teal',
      hex: '#008080',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    renderCatalogManager();
    await screen.findByText('Tops');
    await user.selectOptions(screen.getByLabelText('Catalog type'), 'colors');

    await user.type(screen.getByLabelText('Name'), 'Teal');
    await user.clear(screen.getByLabelText('Hex'));
    await user.type(screen.getByLabelText('Hex'), '#008080');
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(mockedAdminService.createCatalogEntry.mock.calls[0]?.[0]).toEqual({
      type: 'colors',
      name: 'Teal',
      hex: '#008080',
    });
  });

  it('deactivates an active entry', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchAdminCatalog.mockResolvedValue(buildCatalog());
    mockedAdminService.deactivateCatalogEntry.mockResolvedValue(undefined);

    renderCatalogManager();
    await screen.findByText('Tops');

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(mockedAdminService.deactivateCatalogEntry).toHaveBeenCalledWith('categories', 'cat-1');
    expect(await screen.findByText('Entry deactivated')).toBeInTheDocument();
  });
});
