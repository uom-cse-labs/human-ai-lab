import type { ContentItem } from '../api/client.ts'

/** "Open Day 2026!" → "open-day-2026" */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export type PublishState = 'draft' | 'live' | 'changed' | 'hidden'

/** What visitors see compared with the saved draft. */
export function publishState(item: ContentItem): PublishState {
  if (item.status === 'unpublished') return 'hidden'
  if (item.status === 'draft' || item.publishedVersion == null) return 'draft'
  return item.publishedVersion < item.version ? 'changed' : 'live'
}

export function stringField(item: ContentItem | undefined, key: string): string {
  const value = item?.fields?.[key]
  return typeof value === 'string' ? value : ''
}
