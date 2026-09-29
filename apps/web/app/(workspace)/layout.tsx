import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Nav } from '@/components/nav';

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  // the refresh cookie is the session: an expired access token is rotated by the gateway, not evicted
  if (!jar.get('eos_refresh')?.value) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="min-w-0 flex-1 border-l border-line">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
