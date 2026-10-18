import type { components } from '@hai/content-schema'

export type ContentItem = components['schemas']['ContentItem']
export type ContentItemInput = components['schemas']['ContentItemInput']
export type ContentItemPage = components['schemas']['ContentItemPage']
export type Release = components['schemas']['Release']
export type ReleasePage = components['schemas']['ReleasePage']
export type Problem = components['schemas']['Problem']
export type MediaAsset = components['schemas']['MediaAsset']
export type MediaAssetPage = components['schemas']['MediaAssetPage']
export type UploadTicket = components['schemas']['UploadTicket']
export type Session = components['schemas']['Session']
export type UploadContentType = components['schemas']['UploadRequest']['contentType']

/**
 * The Cloudflare Access sign-in has expired: requests are redirected to the sign-in page, which the browser
 * won't follow for a background request. Reloading the page signs in again.
 */
export class SessionExpiredError extends Error {
  constructor() {
    super('Your sign-in has expired.')
  }
}

/** The API could not be reached at all (no network, or the local API isn't running). */
export class OfflineError extends Error {
  constructor() {
    super('Could not reach the server.')
  }
}

/**
 * fetch, telling apart an expired sign-in (a redirect to the Access login) and an unreachable server from
 * ordinary API responses.
 */
async function apiFetch(url: string, init: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, { ...init, redirect: 'manual' })
  } catch {
    throw new OfflineError()
  }
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    throw new SessionExpiredError()
  }
  return response
}

/** An API error carrying the server's problem details (contract: RFC 9457). */
export class ApiError extends Error {
  readonly problem: Problem

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title)
    this.problem = problem
  }

  get code() {
    return this.problem.code
  }
}

/**
 * `vite dev` (npm run dev:local): sign-in is simulated and the role comes from the sidebar picker.
 * Deployed on Cloudflare, Cloudflare Access signs people in before the dashboard loads.
 */
export const SIMULATED_SIGN_IN = import.meta.env.DEV

export type LocalRole = 'admin' | 'editor'

const ROLE_KEY = 'hai.localRole'

let session: Session | null = null

/** Deployed: asks the API who signed in. Resolves to null if it can't tell (e.g. Access not set up yet). */
export async function loadSession(): Promise<Session | null> {
  if (SIMULATED_SIGN_IN) {
    return null
  }
  try {
    session = await request<Session>('GET', '/session')
  } catch {
    session = null
  }
  return session
}

export function getSession(): Session | null {
  return session
}

/** Simulated sign-in only; the API trusts this header only under its `local` profile. */
export function getLocalRole(): LocalRole {
  try {
    return localStorage.getItem(ROLE_KEY) === 'editor' ? 'editor' : 'admin'
  } catch {
    return 'admin'
  }
}

/** Publishing, rolling back, hiding and deleting need the admin role; the API enforces this too. */
export function isAdmin(): boolean {
  return SIMULATED_SIGN_IN ? getLocalRole() === 'admin' : session?.role === 'admin'
}

function roleHeader(): Record<string, string> {
  return SIMULATED_SIGN_IN ? { 'X-Local-Role': getLocalRole() } : {}
}

export function setLocalRole(role: LocalRole) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    // Storage unavailable (private window): the role resets to admin on reload.
  }
}

async function request<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await apiFetch(`/api${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...roleHeader(),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204) {
    return undefined as T
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      data?.code
        ? data
        : { type: 'about:blank', title: response.statusText, status: response.status, code: `HTTP_${response.status}` },
    )
  }
  return data as T
}

export type ContentTypeKey = components['schemas']['ContentType']

const content = {
  list: (type: ContentTypeKey) => request<ContentItemPage>('GET', `/content/${type}?limit=100`),
  get: (type: ContentTypeKey, id: string) => request<ContentItem>('GET', `/content/${type}/${id}`),
  create: (type: ContentTypeKey, input: ContentItemInput) => request<ContentItem>('POST', `/content/${type}`, input),
  update: (type: ContentTypeKey, id: string, version: number, input: ContentItemInput) =>
    request<ContentItem>('PUT', `/content/${type}/${id}`, input, { 'If-Match': String(version) }),
  unpublish: (type: ContentTypeKey, id: string) => request<ContentItem>('POST', `/content/${type}/${id}/unpublish`),
  delete: (type: ContentTypeKey, id: string) => request<void>('DELETE', `/content/${type}/${id}`),
}

const media = {
  list: () => request<MediaAssetPage>('GET', '/media?limit=100'),
  get: (id: string) => request<MediaAsset>('GET', `/media/${id}`),
  describe: (id: string, altText: string, caption?: string) =>
    request<MediaAsset>('PATCH', `/media/${id}`, { altText, ...(caption !== undefined ? { caption } : {}) }),
  usage: (id: string) => request<{ kind: string; ref: string }[]>('GET', `/media/${id}/usage`),
  delete: (id: string) => request<void>('DELETE', `/media/${id}`),

  /**
   * Uploads a photo: ask the API for an upload URL, send the file there (the API itself, locally and on
   * Cloudflare), then tell the API it has arrived.
   */
  async upload(file: File, altText: string): Promise<MediaAsset> {
    const ticket = await request<UploadTicket>('POST', '/media/uploads', {
      fileName: file.name,
      contentType: file.type as UploadContentType,
      sizeBytes: file.size,
    })
    const put = await apiFetch(ticket.parts[0].url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, ...roleHeader() },
      body: file,
    })
    if (!put.ok) {
      throw new ApiError({ type: 'about:blank', title: 'Upload failed', status: put.status, code: 'UPLOAD_FAILED', detail: 'The file could not be uploaded. Check your connection and try again.' })
    }
    const asset = await request<MediaAsset>('POST', `/media/${ticket.mediaId}/complete`, {
      uploadId: ticket.uploadId,
      parts: [{ partNumber: 1, etag: put.headers.get('ETag') ?? '' }],
    })
    if (asset.status === 'failed') {
      throw new ApiError({ type: 'about:blank', title: 'Photo rejected', status: 422, code: 'MEDIA_REJECTED', detail: asset.failureReason ?? 'This photo could not be processed.' })
    }
    return altText.trim() ? media.describe(asset.id, altText.trim()) : asset
  },
}

export const api = {
  content,
  media,
  listNews: () => content.list('news'),
  getNews: (id: string) => content.get('news', id),
  createNews: (input: ContentItemInput) => content.create('news', input),
  updateNews: (id: string, version: number, input: ContentItemInput) => content.update('news', id, version, input),
  unpublishNews: (id: string) => content.unpublish('news', id),
  deleteNews: (id: string) => content.delete('news', id),
  publish: (note: string) => request<Release>('POST', '/publish', { note: note || undefined }),
  listReleases: () => request<ReleasePage>('GET', '/releases?limit=100'),
  restoreRelease: (id: string) => request<Release>('POST', `/releases/${id}/restore`),
}
