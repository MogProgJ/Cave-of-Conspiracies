/**
 * src/lib/api.ts — PHP backend API client
 *
 * All calls to the PHP backend go through this module.
 * The base URL defaults to same-origin /api and can be overridden
 * via the VITE_API_BASE_URL environment variable.
 *
 * Usage:
 *   import { getSession } from '@/src/lib/api';
 *   const { data } = await getSession();
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResult<T> = ApiOk<T> | ApiError;

export interface SessionAccount {
  id: number;
  display_name: string;
  role: string;
}

export interface SessionState {
  authenticated: boolean;
  account: SessionAccount | null;
  is_admin: boolean;
}

export interface HealthState {
  status: string;
  timestamp: string;
  php: string;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const url = `${BASE_URL}/${path.replace(/^\//, '')}`;
  try {
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...init?.headers },
      ...init,
    });
    const json = (await res.json()) as ApiResult<T>;
    return json;
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/health — liveness check.
 * Returns PHP version and server timestamp.
 */
export async function getHealth(): Promise<ApiResult<HealthState>> {
  return apiFetch<HealthState>('health');
}

/**
 * GET /api/session — current login state.
 * Returns whether the visitor is authenticated and their basic profile.
 * Call this once at app bootstrap to seed the session context.
 */
export async function getSession(): Promise<ApiResult<SessionState>> {
  return apiFetch<SessionState>('session');
}
