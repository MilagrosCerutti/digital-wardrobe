import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext, useAuth } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import * as authService from '@/features/auth/services/authService';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/utils/storageKeys';

vi.mock('@/features/auth/services/authService');

const BASE_AUTH: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
};

function renderProtected(authValue: AuthContextValue, requiredRole?: AuthUser['role']) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/closet']}>
        <Routes>
          <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
            <Route path="/closet" element={<div>Closet content</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is being resolved', () => {
    renderProtected({ ...BASE_AUTH, isLoading: true });

    expect(screen.getByText('Loading your session')).toBeInTheDocument();
    expect(screen.queryByText('Closet content')).not.toBeInTheDocument();
  });

  it('redirects to /login when the user is not authenticated', () => {
    renderProtected({ ...BASE_AUTH, isAuthenticated: false });

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    const user: AuthUser = {
      id: 'user-1',
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    renderProtected({ ...BASE_AUTH, isAuthenticated: true, user });

    expect(screen.getByText('Closet content')).toBeInTheDocument();
  });

  it('redirects a non-admin user away from an admin-only route', () => {
    const user: AuthUser = {
      id: 'user-1',
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    renderProtected({ ...BASE_AUTH, isAuthenticated: true, user }, 'ADMIN');

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Closet content')).not.toBeInTheDocument();
  });

  it('redirects to /login when logging out from a protected page (regression: no navigate() race)', async () => {
    const user = userEvent.setup();
    const mockedAuthService = vi.mocked(authService);
    const authUser: AuthUser = {
      id: 'user-1',
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '',
      updatedAt: '',
    };
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'existing-token');
    mockedAuthService.fetchCurrentUser.mockResolvedValue(authUser);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    function ClosetPageWithLogout() {
      const { logout } = useAuth();
      return <button onClick={logout}>Log Out</button>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/closet']}>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/closet" element={<ClosetPageWithLogout />} />
              </Route>
              <Route path="/login" element={<div>Login page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  });
});
