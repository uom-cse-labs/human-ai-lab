/**
 * Publish and roll back (Java: PublishService). A release is written in full first; the pointer switch is one
 * write, so visitors never see a half-published site.
 */
import { ApiError, type FieldError, notFound } from './errors.ts'
import { CONTENT_TYPES, type ContentItem, page, type Release } from './model.ts'
import { checkPublishRules } from './publish-rules.ts'
import { releaseFiles, type Snapshot } from './release-files.ts'
import type { Files, Store } from './store.ts'

export class PublishService {
  /** One publish or rollback at a time. The API runs as a single Durable Object, so memory is enough. */
  private locked = false

  constructor(
    private readonly store: Store,
    private readonly files: Files,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async publish(note: string | undefined, user: string): Promise<Release> {
    return this.underLock(async () => {
      const snapshot = this.snapshot()
      const problems = [...checkPublishRules(snapshot), ...this.mediaProblems(snapshot)]
      if (problems.length) {
        throw new ApiError(422, 'VALIDATION_FAILED', 'Nothing was published. Fix these items and publish again.', problems)
      }
      const release: Release = {
        id: this.nextReleaseId(),
        publishedBy: user,
        publishedAt: this.now().toISOString(),
        ...(note ? { note } : {}),
      }
      for (const [name, content] of Object.entries(releaseFiles(snapshot))) {
        await this.files.put(`content/releases/${release.id}/${name}`, JSON.stringify(content), 'application/json')
      }
      await this.pointTo(release)
      this.store.recordRelease(release)
      this.markPublished(snapshot)
      return release
    })
  }

  async restore(releaseId: string): Promise<Release> {
    return this.underLock(async () => {
      const release = this.store.getRelease(releaseId)
      if (!release) {
        throw notFound(`release ${releaseId}`)
      }
      await this.pointTo(release)
      return release
    })
  }

  list(cursor: string | undefined, limit: number) {
    return page(this.store.listReleases(), cursor, limit)
  }

  /** The release visitors see: the one the pointer names. */
  async currentReleaseId(): Promise<string | undefined> {
    const pointer = await this.files.get('content/current.json')
    return pointer ? (JSON.parse(new TextDecoder().decode(pointer)) as { release: string }).release : undefined
  }

  private async pointTo(release: Release) {
    await this.files.put('content/current.json',
      JSON.stringify({ schema: 1, release: release.id, publishedAt: release.publishedAt }), 'application/json')
  }

  private snapshot(): Snapshot {
    return new Map(CONTENT_TYPES.map((type) => [type, this.store.listItems(type).filter((i) => i.status !== 'unpublished')]))
  }

  /** Every photo an item uses must be processed and have alt text. */
  private mediaProblems(snapshot: Snapshot): FieldError[] {
    const problems: FieldError[] = []
    for (const items of snapshot.values()) {
      for (const item of items) {
        for (const ref of item.mediaRefs) {
          const field = `${item.type}/${item.id}.media`
          const asset = this.store.getMedia(ref)
          if (!asset) {
            problems.push({ field, message: `"${item.title}" uses a photo that was deleted. Choose another.` })
          } else if (asset.status !== 'ready') {
            problems.push({ field, message: `"${item.title}" uses a photo that isn't ready (${asset.status}).` })
          } else if (!asset.altText?.trim()) {
            problems.push({ field, message: `"${item.title}" uses the photo "${asset.fileName}", which needs alt text. Add it in the media library.` })
          }
        }
      }
    }
    return problems
  }

  /**
   * Records the version that went live. An item saved again while publishing keeps its newer version: the
   * release has the earlier one, and the item correctly keeps showing unpublished changes.
   */
  private markPublished(snapshot: Snapshot) {
    for (const items of snapshot.values()) {
      for (const item of items) {
        if (item.status === 'published' && item.publishedVersion === item.version) {
          continue
        }
        const live: ContentItem = { ...item, status: 'published', publishedVersion: item.version }
        this.store.saveItem(live, item.version)
      }
    }
  }

  /** e.g. 2026-10-02T09-15-00Z, with -2, -3… for releases in the same second. */
  private nextReleaseId(): string {
    const id = this.now().toISOString().replace(/\.\d+Z$/, 'Z').replaceAll(':', '-')
    let candidate = id
    for (let n = 2; this.store.getRelease(candidate); n++) {
      candidate = `${id}-${n}`
    }
    return candidate
  }

  private async underLock<T>(work: () => Promise<T>): Promise<T> {
    if (this.locked) {
      throw new ApiError(409, 'PUBLISH_IN_PROGRESS', 'Another publish is in progress. Try again in a moment.')
    }
    this.locked = true
    try {
      return await work()
    } finally {
      this.locked = false
    }
  }
}
