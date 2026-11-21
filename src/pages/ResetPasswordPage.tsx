import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { FormField, Input } from '@/components/ui/form-controls';
import { resetPassword } from '@/services/auth-api';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) {
      setError('The reset link is missing or invalid.');
      return;
    }
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
      await resetPassword(token, password);
      setMessage('Password reset successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <h1 className="text-2xl font-bold text-primary">Reset password</h1>
      {!token ? <Alert tone="danger" title="Invalid reset link">This reset link is missing a token.</Alert> : null}
      <FormField label="New password" htmlFor="reset-password" description="At least 12 characters" required>
        <div className="relative"><Input id="reset-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required className="pr-11" /><button type="button" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
      </FormField>
      <FormField label="Confirm new password" htmlFor="reset-confirm-password" required><Input id="reset-confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></FormField>
      {message ? <Alert tone="success" title="Password updated">{message}</Alert> : null}
      {error ? <Alert tone="danger" title="Reset failed">{error}</Alert> : null}
      <Button type="submit" className="w-full" isLoading={loading}>Reset password</Button>
      <Link className="block text-center text-sm text-primary underline" to="/login">Back to login</Link>
    </form>
  );
}
