import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input } from '@/components/ui/form-controls';
import { ApiError } from '@/services/api-client';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setValidationError(null);
    if (!email.trim() || !password) {
      setValidationError('Enter your email and password.');
      return;
    }
    try {
      await login(email, password);
      const state = location.state as { from?: string } | null;
      navigate(state?.from && state.from !== '/login' ? state.from : '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Login failed.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Log in</h1>
        <p className="mt-1 text-sm text-foreground">Access your SERV HUB account.</p>
      </div>
      <FormField label="Email" htmlFor="login-email" required>
        <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </FormField>
      <FormField label="Password" htmlFor="login-password" required>
        <div className="relative">
          <Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="pr-11" />
          <button type="button" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
      </FormField>
      {validationError ? <Alert tone="warning" title="Check your details">{validationError}</Alert> : null}
      {error ? <Alert tone="danger" title="Login unavailable">{error}</Alert> : null}
      <Button type="submit" className="w-full" isLoading={isLoading}>Log in</Button>
      <div className="flex flex-wrap justify-between gap-3 text-sm"><Link className="text-primary underline" to="/forgot-password">Forgot password?</Link><Link className="text-primary underline" to="/register">Create an account</Link></div>
    </form>
  );
}
