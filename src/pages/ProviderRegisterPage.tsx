import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input, Select } from '@/components/ui/form-controls';
import { registerBusinessProvider, registerIndividualProvider } from '@/services/auth-api';

export function ProviderRegisterPage() {
  const [providerType, setProviderType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (providerType === 'INDIVIDUAL') {
        await registerIndividualProvider({ displayName: name, email, password, contactPhone: phone || undefined });
      } else {
        await registerBusinessProvider({ businessName: name, email, password, contactPhone: phone || undefined });
      }
      setMessage('Provider account submitted. Check your email to verify the account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="pb-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For professionals and businesses</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Register as a provider</h1><p className="mt-3 text-sm text-foreground-secondary">Connect your services with customers across Sri Lanka.</p></div>
      <FormField label="Provider type" htmlFor="provider-type"><Select id="provider-type" value={providerType} onChange={(event) => setProviderType(event.target.value as 'INDIVIDUAL' | 'BUSINESS')}><option value="INDIVIDUAL">Individual professional</option><option value="BUSINESS">Business</option></Select></FormField>
      <FormField label={providerType === 'BUSINESS' ? 'Business name' : 'Display name'} htmlFor="provider-name" required><Input id="provider-name" value={name} onChange={(event) => setName(event.target.value)} required /></FormField>
      <FormField label="Email" htmlFor="provider-email" required><Input id="provider-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField>
      <FormField label="Phone" htmlFor="provider-phone"><Input id="provider-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></FormField>
      <FormField label="Password" htmlFor="provider-password" required><div className="relative"><Input id="provider-password" type={showPassword ? 'text' : 'password'} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required className="pr-11" /><button type="button" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormField>
      <FormField label="Confirm password" htmlFor="provider-confirm-password" required><Input id="provider-confirm-password" type={showPassword ? 'text' : 'password'} minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></FormField>
      {message ? <Alert tone="success" title="Registration submitted">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Registration unavailable">{error}</Alert> : null}
      <Button type="submit" className="min-h-12 w-full" isLoading={loading}>Register provider</Button>
      <p className="border-t border-border pt-4 text-center text-sm text-foreground-secondary">Already have an account? <Link className="font-semibold text-primary underline-offset-4 hover:underline" to="/login">Sign in</Link></p>
    </form>
  );
}
