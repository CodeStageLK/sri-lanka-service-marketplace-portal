import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input } from '@/components/ui/form-controls';
import { ApiError } from '@/services/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { registerCustomer } from '@/services/auth-api';

export function RegisterPage() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setValidationError(null);
    setLoading(true);
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First name and last name are required.');
      setLoading(false);
      return;
    }
    if (password.length < 12) {
      setValidationError('Password must be at least 12 characters.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await registerCustomer({ firstName, lastName, email, password });
      setMessage('Account created. Check your email to verify the account.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="pb-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Get started</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Create your account</h1><p className="mt-3 text-sm text-foreground-secondary">Join SERVE HUB to find the services you need.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="register-first-name" required><Input id="register-first-name" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></FormField>
        <FormField label="Last name" htmlFor="register-last-name" required><Input id="register-last-name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required /></FormField>
      </div>
      <FormField label="Email" htmlFor="register-email" required><Input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField>
      <FormField label="Password" htmlFor="register-password" description="At least 12 characters" required>
        <div className="relative"><Input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required className="pr-11" /><button type="button" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
      </FormField>
      <FormField label="Confirm password" htmlFor="register-confirm-password" required><Input id="register-confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></FormField>
      {validationError ? <Alert tone="warning" title="Check your details">{validationError}</Alert> : null}
      {message ? <Alert tone="success" title="Registration submitted">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Registration unavailable">{error}</Alert> : null}
      <Button type="submit" className="min-h-12 w-full" isLoading={loading || isLoading}>Create account</Button>
      <div className="space-y-2 border-t border-border pt-4 text-center text-sm text-foreground-secondary">
        <p>Already have an account? <Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/login">Sign in</Link></p>
        <p>Offer a service? <Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/register-provider">Join as a provider</Link></p>
      </div>
    </form>
  );
}
