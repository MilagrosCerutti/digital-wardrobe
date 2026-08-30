import { NavLink } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';

export function LoginPage() {
  return (
    <div className="dw-grain flex min-h-[calc(100svh-4rem)] items-center justify-center px-5 py-16 sm:px-8">
      <div className="dw-panel w-full max-w-sm bg-paper p-6 shadow-sm">
        <span className="dw-micro text-primary">Welcome back</span>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Log in to your wardrobe</h1>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{' '}
          <NavLink to="/register" className="text-primary underline underline-offset-2">
            Create an account
          </NavLink>
        </p>
      </div>
    </div>
  );
}
