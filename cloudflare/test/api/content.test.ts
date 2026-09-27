import { describe, expect, it } from 'vitest'
import { ContentService } from '../../src/api/content.ts'
import { ApiError } from '../../src/api/errors.ts'
import { hasUnpublishedChanges } from '../../src/api/model.ts'
import { MemoryStore } from '../../src/api/store.ts'

const draft = { slug: 'open-day', title: 'Open day', fields: { date: '2026-10-01' }, mediaRefs: [] }

function service() {
  let tick = 0
  const store = new MemoryStore()
  return { store, contents: new ContentService(store, () => new Date(Date.UTC(2026, 9, 1, 10, 0, tick++))) }
}

describe('ContentService (ported from ContentServiceTest)', () => {
  it('new items start as version-one drafts', () => {
    const { contents } = service()
    const item = contents.create('news', draft, 'asha')
    expect(item).toMatchObject({ type: 'news', slug: 'open-day', status: 'draft', version: 1, updatedBy: 'asha' })
    expect(item.id).toMatch(/^n_[0-9a-f]{8}$/)
    expect(item.publishedVersion).toBeUndefined()
  })

  it('saving bumps the version and keeps the published version', () => {
    const { store, contents } = service()
    const item = contents.create('news', draft, 'asha')
    store.saveItem({ ...item, status: 'published', publishedVersion: 1 }, 1)
    const saved = contents.update('news', item.id, { ...draft, title: 'Open day 2026' }, 1, 'ravi')
    expect(saved).toMatchObject({ version: 2, publishedVersion: 1, status: 'published', title: 'Open day 2026', updatedBy: 'ravi' })
    expect(hasUnpublishedChanges(saved)).toBe(true)
  })

  it('a stale save is rejected with the latest version', () => {
    const { contents } = service()
    const item = contents.create('news', draft, 'asha')
    contents.update('news', item.id, draft, 1, 'ravi')
    expect(() => contents.update('news', item.id, draft, 1, 'asha')).toThrowError(expect.objectContaining({
      status: 409, code: 'VERSION_CONFLICT', message: expect.stringContaining('Changed by ravi'),
    }))
  })

  it('slugs are unique per type', () => {
    const { contents } = service()
    contents.create('news', draft, 'asha')
    expect(() => contents.create('news', draft, 'asha')).toThrowError(expect.objectContaining({ code: 'SLUG_TAKEN' }))
    expect(contents.create('project', draft, 'asha').slug).toBe('open-day')
  })

  it('live items cannot be deleted, but drafts and unpublished items can', () => {
    const { store, contents } = service()
    const item = contents.create('news', draft, 'asha')
    store.saveItem({ ...item, status: 'published', publishedVersion: 1 }, 1)
    expect(() => contents.delete('news', item.id)).toThrowError(expect.objectContaining({ code: 'INVALID_STATE' }))
    contents.unpublish('news', item.id, 'admin')
    contents.delete('news', item.id)
    expect(() => contents.get('news', item.id)).toThrow(ApiError)
  })

  it('an edit keeps an unpublished item hidden', () => {
    const { contents } = service()
    const item = contents.create('news', draft, 'asha')
    contents.unpublish('news', item.id, 'admin')
    expect(contents.update('news', item.id, draft, 2, 'asha').status).toBe('unpublished')
  })
})
