/// <reference types="vite/client" />

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
// Content types
// ---------------------------------------------------------------------------

export interface ThreadCommunity {
  slug: string;
  name: string;
}

/** Compact thread shape — used in listing pages (explore, feed, search). */
export interface ThreadCard {
  id: number;
  title: string;
  body_preview: string;
  author: string | null;
  community: ThreadCommunity | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
}

export interface CommentItem {
  id: number;
  body: string;
  author: string | null;
  created_at: string;
}

/** Full thread shape — used in single-thread detail page. */
export interface ThreadDetail {
  id: number;
  title: string;
  body: string;
  author: string | null;
  community: ThreadCommunity | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  comments: CommentItem[];
}

/** Community card shape — includes presentation metadata (icon, category, color). */
export interface CommunityCard {
  slug: string;
  name: string;
  tagline: string | null;
  /** Lucide icon component name. */
  icon: string;
  category: string;
  /** Tailwind color token for tinting (e.g. "slate", "red"). */
  color: string;
  posts_7d: number;
  comments_7d: number;
}

export interface ProfileStats {
  post_count: number;
  comment_count: number;
}

/** Public profile summary shape. */
export interface ProfileSummary {
  id: number;
  display_name: string;
  bio: string | null;
  role: string;
  joined_at: string;
  stats: ProfileStats;
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

/**
 * GET /api/threads?community=<slug>&sort=new|top&page=<n>&limit=<n>
 * Returns a paginated list of thread cards.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getThreads(params?: {
  community?: string;
  sort?: 'new' | 'top' | 'old';
  page?: number;
  limit?: number;
}): Promise<ApiResult<{ threads: ThreadCard[]; total: number }>> {
  const qs = new URLSearchParams();
  if (params?.community) qs.set('community', params.community);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.page != null) qs.set('page', String(params.page));
  if (params?.limit != null) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<{ threads: ThreadCard[]; total: number }>(`threads${query}`);
}

/**
 * GET /api/threads/<id>
 * Returns the full thread detail including all comments.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getThread(id: number): Promise<ApiResult<ThreadDetail>> {
  return apiFetch<ThreadDetail>(`threads/${id}`);
}

/**
 * GET /api/communities
 * Returns a list of community cards enriched with presentation metadata.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getCommunities(): Promise<ApiResult<{ communities: CommunityCard[] }>> {
  return apiFetch<{ communities: CommunityCard[] }>('communities');
}

/**
 * GET /api/profiles/<id>
 * Returns the public profile summary for a given account ID.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getProfile(id: number): Promise<ApiResult<ProfileSummary>> {
  return apiFetch<ProfileSummary>(`profiles/${id}`);
}
