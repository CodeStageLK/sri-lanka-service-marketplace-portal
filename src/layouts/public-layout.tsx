import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { canAccessCustomer, canAccessProvider } from '@/lib/portal-access';
import { useAuthStore } from '@/stores/auth-store';

export function PublicLayout() {
  const user = useAuthStore((state) => state.user);
  const accountPath = canAccessCustomer(user) ? '/account/dashboard' : canAccessProvider(user) ? '/provider/dashboard' : null;
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="SERVE HUB portal home" className="inline-flex rounded-md bg-white p-2">
            <img src="/serve-hub-logo.png" alt="SERVE HUB" width="1665" height="410" className="h-auto w-36 sm:w-44" />
          </Link>
          <nav aria-label="Portal account" className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to={accountPath ?? '/login'} className="rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground">{accountPath ? 'Account' : 'Sign in'}</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  );
}
