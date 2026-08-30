import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { ToastProvider } from '@/components/Toast';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';
import type { AuthUser } from '@/features/auth/types/auth.types';

const USER: AuthUser = {
  id: 'user-1',
  firstName: 'Mila',
  lastName: 'Cerutti',
  email: 'mila@example.com',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderProfilePage(overrides: Partial<AuthContextValue> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: USER,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    ...overrides,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/profile']}>
            <Routes>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<div>Home page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  it('shows the profile form pre-filled and the change password form', () => {
    renderProfilePage();

    expect(screen.getByLabelText('First name')).toHaveValue('Mila');
    expect(screen.getByLabelText('Current password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });

  it('calls logout when Log Out is clicked', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderProfilePage({ logout });

    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
