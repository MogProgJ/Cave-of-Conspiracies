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
  error?: undefined;
}

export interface ApiError {
  ok: false;
  error: string;
  data?: undefined;
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

export interface SessionPayload {
  authenticated: boolean;
  account: (SessionAccount & {
    bio?: string | null;
    email?: string;
    created_at?: string;
  }) | null;
  is_admin: boolean;
}

export interface FeedResponse {
  threads: ThreadCard[];
  total: number;
  page: number;
  pages: number;
}

export interface CommunityDetailResponse {
  community: CommunityCard;
  threads: ThreadCard[];
  total: number;
}

export interface ProfileResponse {
  profile: ProfileSummary;
  threads: ThreadCard[];
  comments: CommentItem[];
}

export interface VoteResponse {
  id: number;
  upvotes: number;
  downvotes: number;
}

export interface SearchResponse {
  query: string;
  threads: ThreadCard[];
  communities: CommunityCard[];
}

export interface AdminReportItem {
  id: number;
  target_type: 'message' | 'comment';
  target_id: number;
  reason: string;
  note: string;
  status: string;
  target_body: string | null;
  created_at: string;
}

export interface AdminReportsResponse {
  status: string;
  reports: AdminReportItem[];
  open_count: number;
}

export interface ProfileSettings {
  id: number;
  email: string;
  display_name: string;
  bio: string;
  role: string;
  created_at: string;
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

function jsonRequest(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', payload?: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  };
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
export async function getSession(): Promise<ApiResult<SessionPayload>> {
  return apiFetch<SessionPayload>('session');
}

/**
 * GET /api/threads?community=<slug>&sort=new|top&page=<n>&limit=<n>
 * Returns a paginated list of thread cards.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getFeed(params?: {
  community?: string;
  sort?: 'new' | 'top' | 'old';
  page?: number;
  limit?: number;
  q?: string;
}): Promise<ApiResult<FeedResponse>> {
  const qs = new URLSearchParams();
  if (params?.community) qs.set('community', params.community);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.page != null) qs.set('page', String(params.page));
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.q) qs.set('q', params.q);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<FeedResponse>(`feed${query}`);
}

export async function getThreads(params?: {
  community?: string;
  sort?: 'new' | 'top' | 'old';
  page?: number;
  limit?: number;
  q?: string;
}): Promise<ApiResult<FeedResponse>> {
  return getFeed(params);
}

/**
 * GET /api/threads/<id>
 * Returns the full thread detail including all comments.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getThread(id: number): Promise<ApiResult<ThreadDetail>> {
  return apiFetch<ThreadDetail>(`threads/${id}`);
}

export async function createThread(payload: {
  title: string;
  body: string;
  community_slug?: string;
}): Promise<ApiResult<ThreadDetail>> {
  return apiFetch<ThreadDetail>('threads', jsonRequest('POST', payload));
}

export async function createComment(threadId: number, payload: { body: string }): Promise<ApiResult<{ comment: CommentItem }>> {
  return apiFetch<{ comment: CommentItem }>(`threads/${threadId}/comments`, jsonRequest('POST', payload));
}

export async function voteThread(threadId: number, payload: { type: 'up' | 'down' }): Promise<ApiResult<VoteResponse>> {
  return apiFetch<VoteResponse>(`threads/${threadId}/vote`, jsonRequest('POST', payload));
}

export async function submitReport(payload: {
  target_type: 'message' | 'comment';
  target_id: number;
  reason: 'spam' | 'abuse' | 'illegal' | 'misinfo' | 'other';
  note?: string;
}): Promise<ApiResult<{ reported: boolean }>> {
  return apiFetch<{ reported: boolean }>('reports', jsonRequest('POST', payload));
}

/**
 * GET /api/communities
 * Returns a list of community cards enriched with presentation metadata.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getCommunities(): Promise<ApiResult<{ communities: CommunityCard[] }>> {
  return apiFetch<{ communities: CommunityCard[] }>('communities');
}

export async function getCommunity(slug: string): Promise<ApiResult<CommunityDetailResponse>> {
  return apiFetch<CommunityDetailResponse>(`communities/${slug}`);
}

/**
 * GET /api/profiles/<id>
 * Returns the public profile summary for a given account ID.
 * Not yet implemented on the backend — placeholder for next integration phase.
 */
export async function getMyProfile(): Promise<ApiResult<ProfileResponse>> {
  return apiFetch<ProfileResponse>('profile/me');
}

export async function getProfile(id: number): Promise<ApiResult<ProfileResponse>> {
  return apiFetch<ProfileResponse>(`profile/${id}`);
}

export async function login(payload: { email: string; password: string }): Promise<ApiResult<SessionPayload>> {
  return apiFetch<SessionPayload>('auth/login', jsonRequest('POST', payload));
}

export async function register(payload: {
  email: string;
  password: string;
  password_confirm: string;
  display_name: string;
}): Promise<ApiResult<SessionPayload>> {
  return apiFetch<SessionPayload>('auth/register', jsonRequest('POST', payload));
}

export async function logout(): Promise<ApiResult<{ authenticated: boolean }>> {
  return apiFetch<{ authenticated: boolean }>('auth/logout', jsonRequest('POST'));
}

export async function searchContent(params: {
  q: string;
  limit?: number;
}): Promise<ApiResult<SearchResponse>> {
  const qs = new URLSearchParams();
  qs.set('q', params.q);
  if (params.limit != null) {
    qs.set('limit', String(params.limit));
  }
  return apiFetch<SearchResponse>(`search?${qs.toString()}`);
}

export async function adminLogin(payload: { password: string }): Promise<ApiResult<{ is_admin: boolean }>> {
  return apiFetch<{ is_admin: boolean }>('admin/login', jsonRequest('POST', payload));
}

export async function adminLogout(): Promise<ApiResult<{ is_admin: boolean }>> {
  return apiFetch<{ is_admin: boolean }>('admin/logout', jsonRequest('POST'));
}

export async function getAdminReports(status: string = 'open'): Promise<ApiResult<AdminReportsResponse>> {
  return apiFetch<AdminReportsResponse>(`admin/reports?status=${encodeURIComponent(status)}`);
}

export async function applyModeration(payload: {
  target_type: 'message' | 'comment';
  target_id: number;
  action: 'hide' | 'remove' | 'restore' | 'dismiss';
  reason?: string;
  report_id?: number;
}): Promise<ApiResult<{ applied: boolean; action: string }>> {
  return apiFetch<{ applied: boolean; action: string }>('admin/moderation', jsonRequest('POST', payload));
}

export async function getProfileSettings(): Promise<ApiResult<ProfileSettings>> {
  return apiFetch<ProfileSettings>('profile/me/settings');
}

export async function updateProfileSettings(payload: {
  display_name: string;
  bio: string;
}): Promise<ApiResult<ProfileSettings>> {
  return apiFetch<ProfileSettings>('profile/me/settings', jsonRequest('POST', payload));
}

export async function changeMyPassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<ApiResult<{ changed: boolean }>> {
  return apiFetch<{ changed: boolean }>('profile/me/password', jsonRequest('POST', payload));
}
