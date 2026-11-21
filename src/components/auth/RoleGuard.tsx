import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessCustomer, canAccessProvider } from '@/lib/portal-access';

function RoleGuard({ role }: { role: 'customer' | 'provider' }) {
  const location = useLocation();
  const { user, isInitialized, isLoading } = useAuthStore();
  if (!isInitialized || isLoading) return <main className="grid min-h-screen place-items-center">Loading…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const allowed = role === 'customer' ? canAccessCustomer(user) : canAccessProvider(user);
  if (!allowed) {
    return <main className="grid min-h-screen place-items-center">This account is not authorized for this dashboard.</main>;
  }
  return <Outlet />;
}

export function CustomerGuard() {
  return <RoleGuard role="customer" />;
}

export function ProviderGuard() {
  return <RoleGuard role="provider" />;
}
