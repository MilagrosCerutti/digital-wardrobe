import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthContextValue } from '@/features/auth/context/AuthContext';

function renderRegisterForm(register: AuthContextValue['register']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register,
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/closet" element={<div>Closet page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('RegisterForm', () => {
  it('rejects a weak password before calling register', async () => {
    const user = userEvent.setup();
    const register = vi.fn();
    renderRegisterForm(register);

    await user.type(screen.getByLabelText('First name'), 'Mila');
    await user.type(screen.getByLabelText('Last name'), 'Cerutti');
    await user.type(screen.getByLabelText('Email'), 'mila@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      await screen.findByText('Password must be at least 8 characters long.'),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('registers and navigates to /closet on success', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue(undefined);
    renderRegisterForm(register);

    await user.type(screen.getByLabelText('First name'), 'Mila');
    await user.type(screen.getByLabelText('Last name'), 'Cerutti');
    await user.type(screen.getByLabelText('Email'), 'mila@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret1');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Closet page')).toBeInTheDocument();
    expect(register.mock.calls[0]?.[0]).toEqual({
      firstName: 'Mila',
      lastName: 'Cerutti',
      email: 'mila@example.com',
      password: 'supersecret1',
    });
  });

  it('shows a server error when the email is already registered', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockRejectedValue({
      response: { data: { error: 'An account with this email already exists.' } },
      isAxiosError: true,
    });
    renderRegisterForm(register);

    await user.type(screen.getByLabelText('First name'), 'Mila');
    await user.type(screen.getByLabelText('Last name'), 'Cerutti');
    await user.type(screen.getByLabelText('Email'), 'mila@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret1');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    );
  });
});
