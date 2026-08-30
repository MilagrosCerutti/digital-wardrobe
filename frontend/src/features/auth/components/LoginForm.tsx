import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getApiErrorMessage } from '@/utils/apiError';

interface LocationState {
  from?: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      const redirectTo = (location.state as LocationState | null)?.from ?? '/closet';
      navigate(redirectTo, { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = 'Email is required.';
    if (!password) nextFieldErrors.password = 'Password is required.';
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    mutation.mutate({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full uppercase">
        {mutation.isPending ? 'Logging in…' : 'Log In'}
      </Button>
    </form>
  );
}
