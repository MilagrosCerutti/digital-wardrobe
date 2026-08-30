import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ToastProvider } from '@/components/Toast';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';

function renderChangePasswordForm(changePassword: AuthContextValue['changePassword']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: null,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <ChangePasswordForm />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('ChangePasswordForm', () => {
  it('rejects a weak new password before calling changePassword', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn();
    renderChangePasswordForm(changePassword);

    await user.type(screen.getByLabelText('Current password'), 'old-password1');
    await user.type(screen.getByLabelText('New password'), 'short');
    await user.type(screen.getByLabelText('Confirm new password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('rejects a mismatched confirmation before calling changePassword', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn();
    renderChangePasswordForm(changePassword);

    await user.type(screen.getByLabelText('Current password'), 'old-password1');
    await user.type(screen.getByLabelText('New password'), 'new-password1');
    await user.type(screen.getByLabelText('Confirm new password'), 'different-password1');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('changes the password, shows a success toast, and clears the fields', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn().mockResolvedValue(undefined);
    renderChangePasswordForm(changePassword);

    await user.type(screen.getByLabelText('Current password'), 'old-password1');
    await user.type(screen.getByLabelText('New password'), 'new-password1');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password1');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(changePassword.mock.calls[0]?.[0]).toEqual({
      currentPassword: 'old-password1',
      newPassword: 'new-password1',
    });
    expect(await screen.findByText('Password changed')).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toHaveValue('');
    expect(screen.getByLabelText('New password')).toHaveValue('');
  });

  it('shows a server error when the current password is incorrect', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn().mockRejectedValue({
      response: { data: { error: 'Current password is incorrect.' } },
      isAxiosError: true,
    });
    renderChangePasswordForm(changePassword);

    await user.type(screen.getByLabelText('Current password'), 'wrong-password1');
    await user.type(screen.getByLabelText('New password'), 'new-password1');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password1');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect.');
  });
});
