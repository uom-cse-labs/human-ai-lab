import type { ContentItem, ContentType, MediaAsset, Release } from './model.ts'

/**
 * Records: content items, media records and the release history. Synchronous, because the Durable Object's
 * SQLite API is: a read-check-write runs without any other request slipping in between.
 */
export interface Store {
  /** Items of a type, newest first by update time. */
  listItems(type: ContentType): ContentItem[]
  getItem(type: ContentType, id: string): ContentItem | undefined
  findBySlug(type: ContentType, slug: string): ContentItem | undefined
  /** Stores `item` only if the stored version still equals `expectedVersion` (0 for a new item). */
  saveItem(item: ContentItem, expectedVersion: number): boolean
  deleteItem(type: ContentType, id: string): void

  /** Newest first. */
  listMedia(): MediaAsset[]
  getMedia(id: string): MediaAsset | undefined
  saveMedia(asset: MediaAsset): void
  deleteMedia(id: string): void

  /** Newest first. */
  listReleases(): Release[]
  getRelease(id: string): Release | undefined
  recordRelease(release: Release): void
}

/** Files in the R2 bucket: published releases (content/), photos (media/) and upload originals (uploads/). */
export interface Files {
  put(key: string, data: ArrayBuffer | Uint8Array | string, contentType: string): Promise<void>
  get(key: string): Promise<Uint8Array | undefined>
  delete(key: string): Promise<void>
  deletePrefix(prefix: string): Promise<void>
}

// ------------------------------------------------------------------------------------ in memory (tests)

export class MemoryStore implements Store {
  private items = new Map<string, ContentItem>()
  private media = new Map<string, MediaAsset>()
  private releases = new Map<string, Release>()

  listItems(type: ContentType) {
    return [...this.items.values()].filter((i) => i.type === type).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  getItem(type: ContentType, id: string) {
    return clone(this.items.get(`${type}/${id}`))
  }
  findBySlug(type: ContentType, slug: string) {
    return this.listItems(type).find((i) => i.slug === slug)
  }
  saveItem(item: ContentItem, expectedVersion: number) {
    if ((this.items.get(`${item.type}/${item.id}`)?.version ?? 0) !== expectedVersion) {
      return false
    }
    this.items.set(`${item.type}/${item.id}`, clone(item)!)
    return true
  }
  deleteItem(type: ContentType, id: string) {
    this.items.delete(`${type}/${id}`)
  }
  listMedia() {
    return [...this.media.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  getMedia(id: string) {
    return clone(this.media.get(id))
  }
  saveMedia(asset: MediaAsset) {
    this.media.set(asset.id, clone(asset)!)
  }
  deleteMedia(id: string) {
    this.media.delete(id)
  }
  listReleases() {
    return [...this.releases.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }
  getRelease(id: string) {
    return this.releases.get(id)
  }
  recordRelease(release: Release) {
    this.releases.set(release.id, release)
  }
}

export class MemoryFiles implements Files {
  readonly files = new Map<string, { data: Uint8Array; contentType: string }>()
  /** Every put and delete, in order: lets tests check that a release is written before its pointer. */
  readonly events: string[] = []

  async put(key: string, data: ArrayBuffer | Uint8Array | string, contentType: string) {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
    this.files.set(key, { data: bytes, contentType })
    this.events.push(`put ${key}`)
  }
  async get(key: string) {
    return this.files.get(key)?.data
  }
  async delete(key: string) {
    this.files.delete(key)
    this.events.push(`delete ${key}`)
  }
  async deletePrefix(prefix: string) {
    for (const key of [...this.files.keys()].filter((k) => k.startsWith(prefix))) {
      await this.delete(key)
    }
  }
  json(key: string): unknown {
    const file = this.files.get(key)
    return file ? JSON.parse(new TextDecoder().decode(file.data)) : undefined
  }
}

function clone<T>(value: T | undefined): T | undefined {
  return value === undefined ? undefined : structuredClone(value)
}

// ------------------------------------------------------------------------------------ Cloudflare

/** The Durable Object's SQLite database. Records are stored as JSON with the columns needed for ordering. */
export class SqlStore implements Store {
  constructor(private readonly sql: SqlStorage) {
    sql.exec(`CREATE TABLE IF NOT EXISTS items (
      type TEXT NOT NULL, id TEXT NOT NULL, slug TEXT NOT NULL, version INTEGER NOT NULL,
      updated_at TEXT NOT NULL, json TEXT NOT NULL, PRIMARY KEY (type, id))`)
    sql.exec('CREATE INDEX IF NOT EXISTS items_by_slug ON items (type, slug)')
    sql.exec('CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, json TEXT NOT NULL)')
    sql.exec('CREATE TABLE IF NOT EXISTS releases (id TEXT PRIMARY KEY, published_at TEXT NOT NULL, json TEXT NOT NULL)')
  }

  listItems(type: ContentType) {
    return this.rows<ContentItem>('SELECT json FROM items WHERE type = ? ORDER BY updated_at DESC', type)
  }
  getItem(type: ContentType, id: string) {
    return this.rows<ContentItem>('SELECT json FROM items WHERE type = ? AND id = ?', type, id)[0]
  }
  findBySlug(type: ContentType, slug: string) {
    return this.rows<ContentItem>('SELECT json FROM items WHERE type = ? AND slug = ? ORDER BY updated_at DESC', type, slug)[0]
  }
  saveItem(item: ContentItem, expectedVersion: number) {
    const stored = this.sql.exec<{ version: number }>('SELECT version FROM items WHERE type = ? AND id = ?', item.type, item.id)
      .toArray()[0]?.version ?? 0
    if (stored !== expectedVersion) {
      return false
    }
    this.sql.exec('INSERT OR REPLACE INTO items (type, id, slug, version, updated_at, json) VALUES (?, ?, ?, ?, ?, ?)',
      item.type, item.id, item.slug, item.version, item.updatedAt, JSON.stringify(item))
    return true
  }
  deleteItem(type: ContentType, id: string) {
    this.sql.exec('DELETE FROM items WHERE type = ? AND id = ?', type, id)
  }
  listMedia() {
    return this.rows<MediaAsset>('SELECT json FROM media ORDER BY created_at DESC')
  }
  getMedia(id: string) {
    return this.rows<MediaAsset>('SELECT json FROM media WHERE id = ?', id)[0]
  }
  saveMedia(asset: MediaAsset) {
    this.sql.exec('INSERT OR REPLACE INTO media (id, created_at, json) VALUES (?, ?, ?)', asset.id, asset.createdAt, JSON.stringify(asset))
  }
  deleteMedia(id: string) {
    this.sql.exec('DELETE FROM media WHERE id = ?', id)
  }
  listReleases() {
    return this.rows<Release>('SELECT json FROM releases ORDER BY published_at DESC')
  }
  getRelease(id: string) {
    return this.rows<Release>('SELECT json FROM releases WHERE id = ?', id)[0]
  }
  recordRelease(release: Release) {
    this.sql.exec('INSERT INTO releases (id, published_at, json) VALUES (?, ?, ?)', release.id, release.publishedAt, JSON.stringify(release))
  }

  private rows<T>(query: string, ...bindings: unknown[]): T[] {
    return this.sql.exec<{ json: string }>(query, ...bindings).toArray().map((r) => JSON.parse(r.json) as T)
  }
}

export class R2Files implements Files {
  constructor(private readonly bucket: R2Bucket) {}

  async put(key: string, data: ArrayBuffer | Uint8Array | string, contentType: string) {
    await this.bucket.put(key, data, { httpMetadata: { contentType } })
  }
  async get(key: string) {
    const object = await this.bucket.get(key)
    return object ? new Uint8Array(await object.arrayBuffer()) : undefined
  }
  async delete(key: string) {
    await this.bucket.delete(key)
  }
  async deletePrefix(prefix: string) {
    let cursor: string | undefined
    do {
      const listed = await this.bucket.list({ prefix, cursor })
      if (listed.objects.length) {
        await this.bucket.delete(listed.objects.map((o) => o.key))
      }
      cursor = listed.truncated ? listed.cursor : undefined
    } while (cursor)
  }
}
