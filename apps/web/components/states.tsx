'use client';

import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui';

export function Loading({ label = 'reading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-dim" role="status">
      <span className="size-1.5 animate-pulse rounded-full bg-accent" />
      {label}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-panel border border-dashed border-line px-4 py-6">
      <p className="text-[13px] text-muted">{title}</p>
      {children && <p className="mt-1 text-[12px] text-dim">{children}</p>}
    </div>
  );
}

/** The control plane gives every refusal a code and a request id, so the screen says both. */
export function Failure({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="rounded-panel border border-weak/40 bg-weak/5 px-4 py-3">
      <p className="text-[13px] text-weak">{error.message}</p>
      <p className="mt-1 text-[11px] text-dim">
        {error.code}
        {error.requestId ? ` · ${error.requestId}` : ''}
      </p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="ghost" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function QueryState({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: ApiError | null;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (error) return <Failure error={error} onRetry={onRetry} />;
  if (loading) return <Loading />;
  return <>{children}</>;
}
