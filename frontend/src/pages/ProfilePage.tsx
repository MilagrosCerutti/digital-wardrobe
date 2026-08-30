import { Button } from '@/components/Button';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { ProfileForm } from '@/features/auth/components/ProfileForm';
import { useAuth } from '@/features/auth/context/AuthContext';

export function ProfilePage() {
  const { logout } = useAuth();

  // No explicit navigate() here: /profile is a protected route, so
  // ProtectedRoute's own isAuthenticated check redirects to /login once
  // logout() takes effect, without racing a second navigation.
  function handleLogout() {
    logout();
  }

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div>
          <span className="dw-micro text-primary">Your Account</span>
          <h1 className="mt-1 text-3xl font-bold text-foreground">Profile & Settings</h1>
        </div>

        <section className="dw-panel flex flex-col gap-4 bg-paper p-5">
          <h2 className="text-lg font-semibold text-foreground">Profile information</h2>
          <ProfileForm />
        </section>

        <section className="dw-panel flex flex-col gap-4 bg-paper p-5">
          <h2 className="text-lg font-semibold text-foreground">Change password</h2>
          <ChangePasswordForm />
        </section>

        <section className="dw-panel flex flex-col gap-4 bg-paper p-5">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <p className="text-sm text-muted-foreground">Sign out of Digital Wardrobe on this device.</p>
          <Button type="button" variant="outline" onClick={handleLogout} className="self-start">
            Log Out
          </Button>
        </section>
      </div>
    </div>
  );
}
