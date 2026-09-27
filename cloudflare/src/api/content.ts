/** Drafting use cases (Java: ContentService). Role checks happen at the API edge. */
import { ApiError, notFound } from './errors.ts'
import { type ContentDraft, type ContentItem, type ContentType, page, shortId } from './model.ts'
import type { Store } from './store.ts'

export class ContentService {
  constructor(private readonly store: Store, private readonly now: () => Date = () => new Date()) {}

  list(type: ContentType, cursor: string | undefined, limit: number) {
    return page(this.store.listItems(type), cursor, limit)
  }

  get(type: ContentType, id: string): ContentItem {
    const item = this.store.getItem(type, id)
    if (!item) {
      throw notFound(`${type} ${id}`)
    }
    return item
  }

  create(type: ContentType, draft: ContentDraft, user: string): ContentItem {
    this.requireFreeSlug(type, draft.slug)
    const item: ContentItem = {
      id: `${type.charAt(0)}_${shortId()}`,
      type,
      ...copy(draft),
      status: 'draft',
      version: 1,
      updatedBy: user,
      updatedAt: this.now().toISOString(),
    }
    this.save(item, 0)
    return item
  }

  update(type: ContentType, id: string, draft: ContentDraft, expectedVersion: number, user: string): ContentItem {
    const current = this.get(type, id)
    if (current.version !== expectedVersion) {
      throw versionConflict(current)
    }
    this.requireFreeSlug(type, draft.slug, id)
    const updated: ContentItem = {
      ...current,
      summary: undefined,
      body: undefined,
      ...copy(draft),
      version: current.version + 1,
      updatedBy: user,
      updatedAt: this.now().toISOString(),
    }
    this.save(updated, expectedVersion)
    return updated
  }

  /** Hides the item from the next release. Admins only. */
  unpublish(type: ContentType, id: string, user: string): ContentItem {
    const current = this.get(type, id)
    const updated: ContentItem = {
      ...current,
      status: 'unpublished',
      version: current.version + 1,
      updatedBy: user,
      updatedAt: this.now().toISOString(),
    }
    this.save(updated, current.version)
    return updated
  }

  /** Deletes an item that visitors can't see: a draft or an unpublished item. Admins only. */
  delete(type: ContentType, id: string): void {
    const current = this.get(type, id)
    if (current.status === 'published') {
      throw new ApiError(409, 'INVALID_STATE', 'Unpublish this item and publish the site before deleting it.')
    }
    this.store.deleteItem(type, id)
  }

  private save(item: ContentItem, expectedVersion: number) {
    if (!this.store.saveItem(item, expectedVersion)) {
      throw versionConflict(this.get(item.type, item.id))
    }
  }

  private requireFreeSlug(type: ContentType, slug: string, ownId?: string) {
    const existing = this.store.findBySlug(type, slug)
    if (existing && existing.id !== ownId) {
      throw new ApiError(409, 'SLUG_TAKEN', `Another ${type} already uses the address "${slug}".`)
    }
  }
}

/** Someone else saved the item first; the message tells the editor who and when. */
export function versionConflict(current: ContentItem): ApiError {
  return new ApiError(409, 'VERSION_CONFLICT',
    `Changed by ${current.updatedBy} at ${current.updatedAt} (now version ${current.version})`)
}

function copy(draft: ContentDraft): ContentDraft {
  return {
    slug: draft.slug,
    title: draft.title,
    ...(draft.summary !== undefined ? { summary: draft.summary } : {}),
    ...(draft.body !== undefined ? { body: draft.body } : {}),
    fields: structuredClone(draft.fields ?? {}),
    mediaRefs: [...(draft.mediaRefs ?? [])],
  }
}
