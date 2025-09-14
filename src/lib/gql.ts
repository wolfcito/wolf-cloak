import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Simple in-memory cache and in-flight dedupe maps
const CACHE_TTL_MS = 10_000; // 10s
const cache = new Map<string, { expiry: number; data: any }>();
const inFlight = new Map<string, Promise<any>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchGraphQL(url: string, query: string, variables: Record<string, unknown>, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  // Handle rate limiting with readable error
  if (res.status === 429) {
    const text = await res.text().catch(() => "Too Many Requests");
    const err: any = new Error(`429 Too Many Requests: ${text}`);
    err.status = 429;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${contentType}. Body: ${text?.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json?.errors?.length) {
    throw new Error(json.errors.map((e: any) => e.message).join("; "));
  }
  return json.data;
}

export function useGql<T = any>(params: {
  query: string;
  variables?: Record<string, unknown>;
  skip?: boolean;
}) {
  const { query, variables = {}, skip = false } = params;
  const url = (import.meta.env.VITE_SUBGRAPH_URL as string) || "";

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const key = useMemo(() => {
    const varsKey = JSON.stringify(variables);
    return `${url}|${query.trim()}|${varsKey}`;
  }, [url, query, JSON.stringify(variables)]);

  const fetchOnce = useCallback(async (force = false) => {
    if (!url || skip) return;
    // Serve from cache
    if (!force) {
      const c = cache.get(key);
      if (c && c.expiry > Date.now()) {
        setData(c.data as T);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Deduplicate in-flight
    if (inFlight.has(key)) {
      try {
        const d = await inFlight.get(key)!;
        if (mounted.current) setData(d as T);
      } catch (e: any) {
        if (mounted.current) setError(e?.message || String(e));
      } finally {
        if (mounted.current) setLoading(false);
      }
      return;
    }

    // Backoff on 429 up to 3 retries
    const controller = new AbortController();
    const attempt = async () => {
      let lastErr: any;
      for (let i = 0; i < 3; i++) {
        try {
          const d = await fetchGraphQL(url, query, variables, controller.signal);
          return d;
        } catch (e: any) {
          lastErr = e;
          if (e?.status === 429) {
            await sleep(250 * Math.pow(2, i));
            continue;
          }
          throw e;
        }
      }
      throw lastErr;
    };

    const p = attempt();
    inFlight.set(key, p);

    try {
      const d = await p;
      cache.set(key, { data: d, expiry: Date.now() + CACHE_TTL_MS });
      if (mounted.current) setData(d as T);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || String(e));
    } finally {
      inFlight.delete(key);
      if (mounted.current) setLoading(false);
    }
  }, [url, key, skip]);

  useEffect(() => {
    void fetchOnce();
  }, [fetchOnce]);

  const refetch = useCallback(() => fetchOnce(true), [fetchOnce]);

  return useMemo(() => ({ data, loading, error, refetch }), [data, loading, error, refetch]);
}
