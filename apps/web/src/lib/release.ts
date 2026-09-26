import { useSyncExternalStore } from 'react'
import type {
  PublishedMembersFile,
  PublishedNewsFile,
  PublishedPublicationsFile,
  PublishedThemesFile,
  ReleasePointer,
} from '@hai/content-schema'

/**
 * Where the site's content comes from:
 * - `bundled` (default): content compiled into the build. Used on Netlify until the AWS cut-over.
 * - `releases`: the current published release under /content, written by the Content API when an admin
 *   publishes from the dashboard (technical design §4.5). Set VITE_CONTENT_SOURCE=releases.
 */
export const CONTENT_SOURCE: 'bundled' | 'releases' =
  import.meta.env.VITE_CONTENT_SOURCE === 'releases' ? 'releases' : 'bundled'

export interface ReleaseFiles {
  news: PublishedNewsFile
  publications: PublishedPublicationsFile
  themes: PublishedThemesFile
  members: PublishedMembersFile
}

export interface ReleaseState {
  status: 'loading' | 'ready' | 'error'
  /** Present once a release has loaded (releases mode only). */
  files?: ReleaseFiles
}

/** Matches the CDN cache on current.json: re-check at most this often, so new releases show up within seconds. */
const RECHECK_MS = 15_000

let state: ReleaseState = { status: CONTENT_SOURCE === 'bundled' ? 'ready' : 'loading' }
const listeners = new Set<() => void>()
let loadedRelease: string | undefined
let lastCheck = 0
let inFlight: Promise<void> | undefined

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' }, cache: 'no-cache' })
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json() as Promise<T>
}

async function loadFiles(release: string): Promise<ReleaseFiles> {
  const base = `/content/releases/${release}`
  const [news, publications, themes, members] = await Promise.all([
    fetchJson<PublishedNewsFile>(`${base}/news.json`),
    fetchJson<PublishedPublicationsFile>(`${base}/publications.json`),
    fetchJson<PublishedThemesFile>(`${base}/themes.json`),
    fetchJson<PublishedMembersFile>(`${base}/members.json`),
  ])
  return { news, publications, themes, members }
}

function setState(next: ReleaseState) {
  state = next
  listeners.forEach((l) => l())
}

/** Checks which release is current and loads its files only when a different release went live. */
function refresh(force = false) {
  if (CONTENT_SOURCE !== 'releases' || inFlight || (!force && Date.now() - lastCheck < RECHECK_MS)) return
  lastCheck = Date.now()
  inFlight = fetchJson<ReleasePointer>('/content/current.json')
    .then(async (pointer) => {
      if (pointer.release !== loadedRelease) {
        setState({ status: 'ready', files: await loadFiles(pointer.release) })
        loadedRelease = pointer.release
      }
    })
    .catch(() => {
      if (state.status === 'loading') setState({ status: 'error' })
    })
    .finally(() => {
      inFlight = undefined
    })
}

if (CONTENT_SOURCE === 'releases' && typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Every page that shows content re-checks, so navigating around picks up new releases.
  refresh(loadedRelease === undefined)
  return () => listeners.delete(listener)
}

/** The current release. Re-checked on navigation and when the tab regains focus. */
export function useRelease(): ReleaseState {
  return useSyncExternalStore(subscribe, () => state, () => state)
}
