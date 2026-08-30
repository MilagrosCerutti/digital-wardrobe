import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';
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

function renderProfileForm(updateProfile: AuthContextValue['updateProfile']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: USER,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile,
    changePassword: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <ProfileForm />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('ProfileForm', () => {
  it('pre-fills the fields with the current user', () => {
    renderProfileForm(vi.fn());

    expect(screen.getByLabelText('First name')).toHaveValue('Mila');
    expect(screen.getByLabelText('Last name')).toHaveValue('Cerutti');
    expect(screen.getByLabelText('Email')).toHaveValue('mila@example.com');
  });

  it('rejects an empty first name before calling updateProfile', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn();
    renderProfileForm(updateProfile);

    await user.clear(screen.getByLabelText('First name'));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('First name is required.')).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('saves changes and shows a success toast', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(undefined);
    renderProfileForm(updateProfile);

    await user.clear(screen.getByLabelText('First name'));
    await user.type(screen.getByLabelText('First name'), 'Milagros');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(updateProfile.mock.calls[0]?.[0]).toEqual({
      firstName: 'Milagros',
      lastName: 'Cerutti',
      email: 'mila@example.com',
    });
    expect(await screen.findByText('Profile updated')).toBeInTheDocument();
  });

  it('shows a server error when the email is already taken', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockRejectedValue({
      response: { data: { error: 'An account with this email already exists.' } },
      isAxiosError: true,
    });
    renderProfileForm(updateProfile);

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    );
  });
});
