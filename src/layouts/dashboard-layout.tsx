import { LayoutDashboard } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="bg-primary p-6 text-primary-foreground md:min-h-screen md:w-64">
        <p className="text-xl font-bold">SERV HUB</p>
        <p className="mt-1 text-sm">Provider portal</p>
        <nav aria-label="Provider navigation" className="mt-8">
          <NavLink to="/dashboard" className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-3 font-semibold">
            <LayoutDashboard aria-hidden="true" size={18} /> Dashboard
          </NavLink>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10"><Outlet /></main>
    </div>
  );
}
