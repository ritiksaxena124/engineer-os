'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';

export interface Query<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  /** Re-reads the path. Passing null parks the query without a request. */
  reload: () => void;
}

/**
 * Every screen shows all four states, so a slow read is never mistaken for an empty one and a
 * refusal is never mistaken for a lack of data.
 */
export function useQuery<T>(path: string | null): Query<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const nonce = useRef(0);

  const load = useCallback(() => {
    if (path === null) return;
    const ticket = ++nonce.current;
    setLoading(true);
    api
      .get<T>(path)
      .then((result) => {
        if (ticket === nonce.current) {
          setData(result);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (ticket === nonce.current) setError(cause as ApiError);
      })
      .finally(() => {
        if (ticket === nonce.current) setLoading(false);
      });
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}
