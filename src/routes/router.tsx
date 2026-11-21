import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { PublicLayout } from '@/layouts/public-layout';
import { CustomerGuard, ProviderGuard } from '@/components/auth/RoleGuard';
import { PortalLoginPage } from '@/pages/PortalLoginPage';
import { ProviderRegisterPage } from '@/pages/ProviderRegisterPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { SearchPage } from '@/pages/SearchPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { CategoryDetailPage } from '@/pages/CategoryDetailPage';
import { SubcategoryPage } from '@/pages/SubcategoryPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ProviderDetailPage } from '@/pages/ProviderDetailPage';
import { CustomerPortalDashboardPage, ProviderPortalDashboardPage } from '@/pages/PortalDashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <SearchPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/categories/:categorySlug/:subcategorySlug', element: <SubcategoryPage /> },
      { path: '/categories/:categorySlug', element: <CategoryDetailPage /> },
      { path: '/services/:serviceSlug', element: <ServiceDetailPage /> },
      { path: '/providers/:providerId', element: <ProviderDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <PortalLoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/register-provider', element: <ProviderRegisterPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <CustomerGuard />,
    children: [{
      element: <DashboardLayout />,
      children: [{ path: '/account/dashboard', element: <CustomerPortalDashboardPage /> }],
    }],
  },
  {
    element: <ProviderGuard />,
    children: [{
      element: <DashboardLayout />,
      children: [{ path: '/provider/dashboard', element: <ProviderPortalDashboardPage /> }],
    }],
  },
]);
