import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { CLINIC } from '../lib/clinic';

// Passwordless by design. Clients already have a Covetrus password for
// booking; a second one would land every reset request on the front desk.
export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('sending');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <main className="auth">
        <h1>Check your email</h1>
        <p>
          We sent a sign-in link to <strong>{email}</strong>. Open it on this
          device and you'll be signed in — no password needed.
        </p>
        <button className="ghost" onClick={() => setStatus('idle')}>
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="auth">
      <h1>{CLINIC.name}</h1>
      <p className="muted">
        Sign in with the email address the clinic has on file for you.
      </p>

      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </main>
  );
}
