import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getApiErrorMessage } from '@/utils/apiError';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => toast({ title: 'Profile updated', variant: 'success' }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: FieldErrors = {};
    if (!firstName.trim()) nextFieldErrors.firstName = 'First name is required.';
    if (!lastName.trim()) nextFieldErrors.lastName = 'Last name is required.';
    if (!email.trim()) nextFieldErrors.email = 'Email is required.';

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    mutation.mutate({ firstName, lastName, email });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={fieldErrors.firstName}
        />
        <Input
          label="Last name"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={fieldErrors.lastName}
        />
      </div>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending} className="mt-2 self-start">
        {mutation.isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  );
}
