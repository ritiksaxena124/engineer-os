'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSession } from '@/components/session';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/path', label: 'Learning path' },
  { href: '/practice', label: 'Practice' },
  { href: '/questions', label: 'Questions' },
  { href: '/dsa', label: 'DSA' },
  { href: '/interview', label: 'Interview' },
  { href: '/progress', label: 'Progress' },
  { href: '/diagnostic', label: 'Diagnostic' },
  { href: '/exam', label: 'Exam' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signOut } = useSession();

  async function logout() {
    try {
      await signOut();
      router.push('/login');
    } catch {
      toast.error('sign-out failed — the session is still active');
    }
  }

  return (
    <nav className="sticky top-0 flex h-screen w-[212px] shrink-0 flex-col justify-between px-3 py-4">
      <div>
        <Link href="/" className="flex items-center gap-2 px-2 text-[13px] text-ink">
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[6, 9, 12, 15, 18, 21].map((height) => (
              <span key={height} style={{ height }} className="w-[3px] rounded-[1px] bg-held" />
            ))}
          </span>
          EngineerOS
        </Link>

        <ul className="mt-6 space-y-0.5">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-control border-l-2 px-3 py-1.5 text-[13px] transition-colors ${
                    active
                      ? 'border-accent bg-raised text-ink'
                      : 'border-transparent text-muted hover:bg-raised hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-line px-2 pt-3">
        {status === 'checking' ? (
          <p className="text-[12px] text-dim">reading session…</p>
        ) : (
          <>
            <p className="truncate text-[12px] text-ink">{user?.displayName}</p>
            <p className="truncate text-[11px] text-dim">{user?.email}</p>
            <button
              onClick={logout}
              className="mt-2 text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
