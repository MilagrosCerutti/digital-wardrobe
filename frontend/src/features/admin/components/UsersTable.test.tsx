import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UsersTable } from './UsersTable';
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

const CURRENT_ADMIN: AuthUser = {
  id: 'admin-1',
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'ada@example.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    firstName: 'Mila',
    lastName: 'Cerutti',
    email: 'mila@example.com',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function renderUsersTable() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: CURRENT_ADMIN,
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
          <UsersTable />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('UsersTable', () => {
  it('lists users with their role and status', async () => {
    mockedAdminService.fetchUsers.mockResolvedValue([buildUser(), CURRENT_ADMIN]);

    renderUsersTable();

    expect(await screen.findByText('Mila Cerutti')).toBeInTheDocument();
    expect(screen.getByText('mila@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ada Admin')).toBeInTheDocument();
  });

  it('disables the action button for the current admin', async () => {
    mockedAdminService.fetchUsers.mockResolvedValue([CURRENT_ADMIN]);

    renderUsersTable();

    expect(await screen.findByRole('button', { name: 'Deactivate' })).toBeDisabled();
  });

  it('deactivates another user', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchUsers.mockResolvedValue([buildUser()]);
    mockedAdminService.deactivateUser.mockResolvedValue(buildUser({ status: 'INACTIVE' }));

    renderUsersTable();

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));

    expect(mockedAdminService.deactivateUser.mock.calls[0]?.[0]).toBe('user-1');
    expect(await screen.findByText('User deactivated')).toBeInTheDocument();
  });

  it('activates an inactive user', async () => {
    const user = userEvent.setup();
    mockedAdminService.fetchUsers.mockResolvedValue([buildUser({ status: 'INACTIVE' })]);
    mockedAdminService.activateUser.mockResolvedValue(buildUser({ status: 'ACTIVE' }));

    renderUsersTable();

    await user.click(await screen.findByRole('button', { name: 'Activate' }));

    expect(mockedAdminService.activateUser.mock.calls[0]?.[0]).toBe('user-1');
    expect(await screen.findByText('User activated')).toBeInTheDocument();
  });
});
