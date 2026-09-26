import type { components } from '@hai/content-schema'

export type ContentItem = components['schemas']['ContentItem']
export type ContentItemInput = components['schemas']['ContentItemInput']
export type ContentItemPage = components['schemas']['ContentItemPage']
export type Release = components['schemas']['Release']
export type ReleasePage = components['schemas']['ReleasePage']
export type Problem = components['schemas']['Problem']

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

export type LocalRole = 'admin' | 'editor'

const ROLE_KEY = 'hai.localRole'

/** Local development has no Cognito yet; the API trusts this header only under its `local` profile. */
export function getLocalRole(): LocalRole {
  try {
    return localStorage.getItem(ROLE_KEY) === 'editor' ? 'editor' : 'admin'
  } catch {
    return 'admin'
  }
}

/** Publishing, rolling back, hiding and deleting need the admin role; the API enforces this too. */
export function isAdmin(): boolean {
  return getLocalRole() === 'admin'
}

export function setLocalRole(role: LocalRole) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    // Storage unavailable (private window): the role resets to admin on reload.
  }
}

async function request<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      'X-Local-Role': getLocalRole(),
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

export const api = {
  content,
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
