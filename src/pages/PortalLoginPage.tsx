import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input } from '@/components/ui/form-controls';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessCustomer, canAccessProvider } from '@/lib/portal-access';

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(loginEmail: string, loginPassword: string, preferred?: 'customer' | 'provider') {
    setError(null);
    try {
      await login(loginEmail, loginPassword);
      const user = useAuthStore.getState().user;
      const requested = (location.state as { from?: unknown } | null)?.from;
      const destination =
        (preferred === 'provider' || (!preferred && requested === '/provider/dashboard')) && canAccessProvider(user)
          ? '/provider/dashboard'
          : (preferred === 'customer' || (!preferred && requested === '/account/dashboard')) && canAccessCustomer(user)
            ? '/account/dashboard'
            : canAccessCustomer(user) ? '/account/dashboard' : '/provider/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void signIn(email, password);
  }

  const demoEmail = import.meta.env.DEV ? import.meta.env.VITE_DEMO_PORTAL_EMAIL : undefined;
  const demoPassword = import.meta.env.DEV ? import.meta.env.VITE_DEMO_PORTAL_PASSWORD : undefined;

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Welcome back</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Sign in to SERVE HUB</h1>
        <p className="mt-3 text-sm leading-6 text-foreground-secondary">Your place to find services and manage your work, all in one account.</p>
      </div>
      <FormField label="Email" htmlFor="portal-login-email" required>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary" />
          <Input id="portal-login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-12 pl-11" />
        </div>
      </FormField>
      <FormField label="Password" htmlFor="portal-login-password" required>
        <div className="relative">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary" />
          <Input id="portal-login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required className="min-h-12 pl-11 pr-11" />
          <button type="button" className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-foreground-secondary" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>
      <div className="text-right text-sm"><Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/forgot-password">Forgot password?</Link></div>
      {error ? <Alert tone="danger" title="Sign-in unavailable">{error}</Alert> : null}
      <Button type="submit" className="min-h-12 w-full gap-2" isLoading={isLoading}>Sign in <ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>
      {demoEmail && demoPassword ? (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-semibold">Development demo sign in</p>
          <p className="text-xs text-foreground-secondary">Demo credentials are visible to users of this development app.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={isLoading} onClick={() => void signIn(demoEmail, demoPassword, 'customer')}>Customer</Button>
            <Button type="button" disabled={isLoading} onClick={() => void signIn(demoEmail, demoPassword, 'provider')}>Service provider</Button>
          </div>
        </div>
      ) : null}
      <div className="space-y-2 border-t border-border pt-5 text-center text-sm text-foreground-secondary">
        <p>New to SERVE HUB? <Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/register">Create a customer account</Link></p>
        <p>Offer a service? <Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/register-provider">Join as a provider</Link></p>
      </div>
    </form>
  );
}
