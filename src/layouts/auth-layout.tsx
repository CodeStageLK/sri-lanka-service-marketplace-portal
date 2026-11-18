import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <p className="mb-6 font-bold text-primary">SERV HUB PROVIDERS</p>
        <Outlet />
      </div>
    </main>
  );
}
