'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ApiError } from '@/lib/api';
import { useSession } from '@/components/session';
import { Button, Field, inputClass } from '@/components/ui';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { signIn, signUp } = useSession();
  const [form, setForm] = useState({ email: '', displayName: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await signIn(form.email.trim(), form.password);
      else await signUp({ email: form.email.trim(), displayName: form.displayName.trim(), password: form.password });
      toast.success(mode === 'login' ? 'Back in.' : 'Account created. Start with the diagnostic.');
      router.push('/');
    } catch (cause) {
      const failure = cause as ApiError;
      setError(failure.message ?? 'that did not work');
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[380px] rounded-panel border border-line bg-surface p-6">
      <h2 className="text-[15px] tracking-tight text-ink">
        {mode === 'login' ? 'Sign in' : 'Create your account'}
      </h2>
      <p className="mt-1 text-[12px] text-dim">
        {mode === 'login' ? 'Your standing is where you left it.' : 'Twelve characters, two letters, two digits.'}
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set('email')}
          />
        </Field>

        {mode === 'register' && (
          <Field label="Display name" hint="How the mentor addresses you.">
            <input
              className={inputClass}
              minLength={2}
              maxLength={80}
              required
              value={form.displayName}
              onChange={set('displayName')}
            />
          </Field>
        )}

        <Field label="Password" error={error}>
          <input
            className={inputClass}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'register' ? 12 : 1}
            required
            value={form.password}
            onChange={set('password')}
          />
        </Field>

        <Button type="submit" busy={busy}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="mt-5 border-t border-line pt-4 text-[12px] text-dim">
        {mode === 'login' ? (
          <>
            No account yet?{' '}
            <Link className="text-accent underline-offset-2 hover:underline" href="/register">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already started?{' '}
            <Link className="text-accent underline-offset-2 hover:underline" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
