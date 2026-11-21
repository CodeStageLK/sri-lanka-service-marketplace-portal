import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resendVerification, verifyEmail } from '@/services/auth-api';
import { Alert } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-controls';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying email…');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMessage('The verification link is missing a token.');
      setFailed(true);
      return;
    }
    verifyEmail(token).then((result) => setMessage(result.message)).catch((error: unknown) => {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : 'Email verification failed.');
    });
  }, [params]);
  async function resend() {
    setResendMessage(null);
    try {
      const result = await resendVerification(email);
      setResendMessage(result.message);
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : 'Unable to resend verification.');
    }
  }
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-primary">Email verification</h1>
      {failed ? <Alert tone="danger" title="Verification unavailable">{message}</Alert> : <Alert tone={message === 'Email verified.' ? 'success' : 'info'} title="Email verification">{message}</Alert>}
      {failed ? (
        <div className="space-y-3">
          <FormField label="Email" htmlFor="resend-verification-email"><Input id="resend-verification-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>
          <Button type="button" variant="outline" className="w-full" disabled={!email} onClick={() => void resend()}>Resend verification email</Button>
          {resendMessage ? <p className="text-sm text-foreground-secondary" role="status">{resendMessage}</p> : null}
        </div>
      ) : null}
      <Link className="inline-block text-sm text-primary underline" to="/login">Back to login</Link>
    </div>
  );
}
