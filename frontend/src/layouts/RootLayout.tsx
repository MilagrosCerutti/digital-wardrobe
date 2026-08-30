import { Outlet } from 'react-router-dom';
import { Navbar } from '@/layouts/Navbar';
import { Footer } from '@/layouts/Footer';

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
