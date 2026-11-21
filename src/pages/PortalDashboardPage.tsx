import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/display';

export function CustomerPortalDashboardPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <section>
      <p className="text-sm text-foreground-secondary">Customer account</p>
      <h1 className="mt-1 text-3xl font-bold text-primary">Welcome, {user?.customerProfile?.firstName ?? 'customer'}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><h2 className="font-semibold text-primary">Discover providers</h2><p className="mt-2 text-sm text-foreground-secondary">Search services and providers.</p><Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline" to="/search">Search marketplace</Link></Card>
        <Card className="p-5"><h2 className="font-semibold text-primary">Account</h2><p className="mt-2 text-sm text-foreground-secondary">{user?.email}</p></Card>
      </div>
    </section>
  );
}

export function ProviderPortalDashboardPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <section>
      <p className="text-sm text-foreground-secondary">Provider account</p>
      <h1 className="mt-1 text-3xl font-bold text-primary">Provider dashboard</h1>
      <Card className="mt-8 p-5">
        <h2 className="font-semibold text-primary">Profile setup</h2>
        <p className="mt-2 text-sm text-foreground-secondary">Provider profile and verification tools will be enabled after the provider portal workflow is completed.</p>
        {user?.providerProfile ? <p className="mt-4 text-sm">Verification status: {user.providerProfile.verificationStatus}</p> : null}
      </Card>
    </section>
  );
}
