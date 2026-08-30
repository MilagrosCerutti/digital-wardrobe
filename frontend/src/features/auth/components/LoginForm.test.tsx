import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';

function renderLoginForm(login: AuthContextValue['login']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/closet" element={<div>Closet page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  it('shows validation errors instead of submitting when fields are empty', async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    renderLoginForm(login);

    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to /closet on success', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderLoginForm(login);

    await user.type(screen.getByLabelText('Email'), 'mila@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-password1');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Closet page')).toBeInTheDocument();
    expect(login.mock.calls[0]?.[0]).toEqual({
      email: 'mila@example.com',
      password: 'correct-password1',
    });
  });

  it('shows a server error message when login fails', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue({
      response: { data: { error: 'Invalid email or password.' } },
      isAxiosError: true,
    });
    renderLoginForm(login);

    await user.type(screen.getByLabelText('Email'), 'mila@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });
});
