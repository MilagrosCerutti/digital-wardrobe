import { Route, Routes } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ClosetPage } from '@/pages/ClosetPage';
import { InspireMePage } from '@/pages/InspireMePage';
import { StyleItPage } from '@/pages/StyleItPage';
import { MyLooksPage } from '@/pages/MyLooksPage';
import { DollPage } from '@/pages/DollPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/inspire-me" element={<InspireMePage />} />
          <Route path="/style-it" element={<StyleItPage />} />
          <Route path="/my-looks" element={<MyLooksPage />} />
          <Route path="/doll" element={<DollPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
