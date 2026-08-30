import { NavLink } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export function RegisterPage() {
  return (
    <div className="dw-grain flex min-h-[calc(100svh-4rem)] items-center justify-center px-5 py-16 sm:px-8">
      <div className="dw-panel w-full max-w-md bg-paper p-6 shadow-sm">
        <span className="dw-micro text-primary">Est. Y2K</span>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Create your wardrobe</h1>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <NavLink to="/login" className="text-primary underline underline-offset-2">
            Log in
          </NavLink>
        </p>
      </div>
    </div>
  );
}
