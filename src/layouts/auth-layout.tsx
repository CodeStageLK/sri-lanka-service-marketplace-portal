import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function AuthLayout() {
  return (
    <main className="portal-auth-background grid min-h-screen place-items-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
        <section className="portal-auth-visual relative flex min-h-56 flex-col justify-between overflow-hidden p-7 text-white sm:p-10 lg:min-h-[680px]">
          <div className="portal-auth-orb portal-auth-orb-one" aria-hidden="true" />
          <div className="portal-auth-orb portal-auth-orb-two" aria-hidden="true" />
          <div className="portal-auth-orb portal-auth-orb-three" aria-hidden="true" />
          <Link className="relative z-10 inline-flex w-fit rounded-lg bg-white p-2" to="/" aria-label="SERVE HUB portal home">
            <img src="/serve-hub-logo.png" alt="SERVE HUB" width="1665" height="410" className="h-auto w-36 sm:w-40" />
          </Link>
          <div className="relative z-10 max-w-sm pt-12 lg:pb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Your service community</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Good people.<br /><span className="text-cyan-200">Great service.</span></h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/85 sm:text-base">Find the right help, or share your skills with customers across Sri Lanka.</p>
          </div>
          <p className="relative z-10 mt-6 hidden text-xs font-medium tracking-wide text-white/75 lg:block">SERVE HUB · Every Service. One Platform.</p>
        </section>
        <div className="flex min-w-0 flex-col px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex justify-end"><ThemeToggle /></div>
          <div className="mx-auto flex w-full max-w-md flex-1 items-center py-8 lg:py-12">
            <div className="w-full"><Outlet /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
