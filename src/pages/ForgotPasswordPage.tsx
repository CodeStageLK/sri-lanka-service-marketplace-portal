import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input } from '@/components/ui/form-controls';
import { forgotPassword } from '@/services/auth-api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div><h1 className="text-2xl font-bold text-primary">Forgot password</h1><p className="mt-1 text-sm text-foreground-secondary">Enter your email to request a reset link.</p></div>
      <FormField label="Email" htmlFor="forgot-email" required><Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField>
      {message ? <Alert tone="info" title="Check your email">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Reset unavailable">{error}</Alert> : null}
      <Button type="submit" className="w-full" isLoading={loading}>Send reset link</Button>
      <Link className="block text-center text-sm text-primary underline" to="/login">Back to login</Link>
    </form>
  );
}
