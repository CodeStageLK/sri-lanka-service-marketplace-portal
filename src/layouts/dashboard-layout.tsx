import { ArrowLeftRight, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessCustomer, canAccessProvider } from '@/lib/portal-access';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const isProvider = useLocation().pathname.startsWith('/provider/');
  const name = isProvider
    ? 'Provider account'
    : user?.customerProfile
      ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`
      : 'Account';
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="bg-primary p-6 text-primary-foreground md:min-h-screen md:w-64">
        <Link className="inline-flex rounded-md bg-white p-2" to="/" aria-label="SERVE HUB portal home">
          <img src="/serve-hub-logo.png" alt="SERVE HUB" width="1665" height="410" className="h-auto w-40" />
        </Link>
        <p className="mt-1 text-sm">{name}</p>
        <div className="mt-4"><ThemeToggle /></div>
        <nav aria-label="Account navigation" className="mt-8">
          <NavLink to={isProvider ? '/provider/dashboard' : '/account/dashboard'} className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-3 font-semibold">
            <LayoutDashboard aria-hidden="true" size={18} /> Dashboard
          </NavLink>
          <NavLink to="/search" className="mt-2 flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">
            <Search aria-hidden="true" size={18} /> Marketplace
          </NavLink>
          {canAccessCustomer(user) && canAccessProvider(user) ? (
            <Link to={isProvider ? '/account/dashboard' : '/provider/dashboard'} className="mt-2 flex min-h-11 items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">
              <ArrowLeftRight aria-hidden="true" size={18} /> Switch to {isProvider ? 'customer' : 'provider'}
            </Link>
          ) : null}
          <button type="button" className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-white/10" onClick={() => void logout()}>
            <LogOut aria-hidden="true" size={18} /> Log out
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10"><Outlet /></main>
    </div>
  );
}
