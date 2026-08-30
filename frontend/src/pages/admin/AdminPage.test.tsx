import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminPage } from './AdminPage';
import { ToastProvider } from '@/components/Toast';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';
import type { AuthUser } from '@/features/auth/types/auth.types';
import * as adminService from '@/features/admin/services/adminService';

vi.mock('@/features/admin/services/adminService');
const mockedAdminService = vi.mocked(adminService);

afterEach(() => {
  vi.clearAllMocks();
});

const ADMIN_USER: AuthUser = {
  id: 'admin-1',
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'ada@example.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

function renderAdminPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: ADMIN_USER,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <AdminPage />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('AdminPage', () => {
  it('shows the Users tab by default', async () => {
    mockedAdminService.fetchUsers.mockResolvedValue([ADMIN_USER]);

    renderAdminPage();

    expect(await screen.findByText('Ada Admin')).toBeInTheDocument();
  });

  it('switches to the Catalogs tab', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchUsers.mockResolvedValue([]);
    mockedAdminService.fetchAdminCatalog.mockResolvedValue({
      categories: [{ id: 'cat-1', name: 'Tops', isActive: true, createdAt: '', updatedAt: '' }],
      subcategories: [],
      materials: [],
      patterns: [],
      colors: [],
      styles: [],
      occasions: [],
    });

    renderAdminPage();

    await user.click(screen.getByRole('tab', { name: 'Catalogs' }));

    expect(await screen.findByText('Tops')).toBeInTheDocument();
  });

  it('switches to the Doll Items tab', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchUsers.mockResolvedValue([]);
    mockedAdminService.fetchDollItems.mockResolvedValue([
      {
        id: 'doll-item-1',
        name: 'Red Hat',
        category: 'ACCESSORY',
        layer: 3,
        assetUrl: 'accessory-bag',
        color: '#F2A7C3',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    renderAdminPage();

    await user.click(screen.getByRole('tab', { name: 'Doll Items' }));

    expect(await screen.findByText('Red Hat')).toBeInTheDocument();
  });
});
