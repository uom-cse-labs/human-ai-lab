/**
 * The Content API's domain model: content items, media assets and releases. Mirrors the Java service
 * (services/content-api, domain package) so the dashboard and the published files behave the same.
 */

export const CONTENT_TYPES = [
  'news', 'project', 'member', 'publication', 'theme', 'gallery', 'page-section', 'site-settings',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value)
}

/** draft: never published. published: in the current release, maybe with newer edits. unpublished: hidden from the next release. */
export type ContentStatus = 'draft' | 'published' | 'unpublished'

export type Fields = Record<string, unknown>

/** What an editor submits when creating or saving an item. */
export interface ContentDraft {
  slug: string
  title: string
  summary?: string
  body?: string
  fields: Fields
  mediaRefs: string[]
}

/**
 * An editable piece of content. `version` increases on every save and is used for optimistic locking;
 * `publishedVersion` is the version captured by the latest release.
 */
export interface ContentItem extends ContentDraft {
  id: string
  type: ContentType
  status: ContentStatus
  version: number
  publishedVersion?: number
  updatedBy: string
  updatedAt: string
}

/** True when the item has edits that visitors can't see yet. */
export function hasUnpublishedChanges(item: ContentItem): boolean {
  return item.status !== 'unpublished' && (item.publishedVersion === undefined || item.publishedVersion < item.version)
}

export type MediaStatus = 'uploading' | 'processing' | 'ready' | 'failed'

/** One processed output of an upload. `src` is the root-relative public path, e.g. /media/m_1a2b3c4d/1600.jpg. */
export interface Rendition {
  src: string
  format: 'jpg' | 'png' | 'webp'
  role: 'srcset'
  width: number
  bytes: number
}

/** An uploaded photo. */
export interface MediaAsset {
  id: string
  kind: 'image'
  status: MediaStatus
  failureReason?: string
  fileName: string
  contentType: string
  sizeBytes: number
  altText?: string
  caption?: string
  width?: number
  height?: number
  renditions: Rendition[]
  uploadedBy: string
  createdAt: string
}

export interface Release {
  id: string
  publishedBy: string
  publishedAt: string
  note?: string
}

/** One page of results; `nextCursor` is absent on the last page. Offset pagination, enough for the lab's volumes. */
export interface Page<T> {
  items: T[]
  nextCursor?: string
}

export function page<T>(all: T[], cursor: string | undefined, limit: number): Page<T> {
  const from = cursor === undefined ? 0 : Math.max(0, Number.parseInt(cursor, 10) || 0)
  const to = Math.min(all.length, from + limit)
  return { items: all.slice(Math.min(from, to), to), ...(to < all.length ? { nextCursor: String(to) } : {}) }
}

/** 8 hex characters, like the Java service's shortened UUIDs. */
export function shortId(): string {
  return crypto.randomUUID().slice(0, 8)
}
