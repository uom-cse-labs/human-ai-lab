import { describe, expect, it } from 'vitest'
import { ContentService } from '../../src/api/content.ts'
import { PublishService } from '../../src/api/publishing.ts'
import { checkPublishRules } from '../../src/api/publish-rules.ts'
import type { ContentItem } from '../../src/api/model.ts'
import { MemoryFiles, MemoryStore } from '../../src/api/store.ts'

function setup(at = new Date('2026-10-02T09:15:00.123Z')) {
  const store = new MemoryStore()
  const files = new MemoryFiles()
  const contents = new ContentService(store, () => at)
  return { store, files, contents, publishing: new PublishService(store, files, () => at) }
}

const news = { slug: 'open-day', title: 'Open day', fields: { date: '2026-10-01' }, mediaRefs: [] }

describe('PublishService (ported from PublishServiceTest)', () => {
  it('writes the release before switching the pointer', async () => {
    const { files, contents, publishing } = setup()
    contents.create('news', news, 'asha')
    const release = await publishing.publish('First', 'admin')
    expect(release).toMatchObject({ id: '2026-10-02T09-15-00Z', publishedBy: 'admin', note: 'First' })
    expect(files.events).toEqual([
      'put content/releases/2026-10-02T09-15-00Z/news.json',
      'put content/releases/2026-10-02T09-15-00Z/publications.json',
      'put content/releases/2026-10-02T09-15-00Z/themes.json',
      'put content/releases/2026-10-02T09-15-00Z/members.json',
      'put content/current.json',
    ])
    expect(files.json('content/current.json')).toEqual({ schema: 1, release: release.id, publishedAt: '2026-10-02T09:15:00.123Z' })
    expect(publishing.list(undefined, 25).items).toEqual([release])
  })

  it('published items record the version that went live', async () => {
    const { store, contents, publishing } = setup()
    const item = contents.create('news', news, 'asha')
    await publishing.publish(undefined, 'admin')
    expect(store.getItem('news', item.id)).toMatchObject({ status: 'published', version: 1, publishedVersion: 1 })
  })

  it('unpublished items are left out', async () => {
    const { files, contents, publishing } = setup()
    contents.create('news', news, 'asha')
    const hidden = contents.create('news', { ...news, slug: 'hidden', title: 'Hidden' }, 'asha')
    contents.unpublish('news', hidden.id, 'admin')
    const release = await publishing.publish(undefined, 'admin')
    const file = files.json(`content/releases/${release.id}/news.json`) as { items: { slug: string }[] }
    expect(file.items.map((i) => i.slug)).toEqual(['open-day'])
  })

  it('invalid content publishes nothing', async () => {
    const { files, contents, publishing } = setup()
    contents.create('news', { ...news, fields: {} }, 'asha')
    await expect(publishing.publish(undefined, 'admin')).rejects.toMatchObject({
      status: 422, code: 'VALIDATION_FAILED', errors: [expect.objectContaining({ field: expect.stringMatching(/\.date$/) })],
    })
    expect(files.events).toEqual([])
    // The lock was released: publishing works once the content is fixed.
    const [item] = contents.list('news', undefined, 25).items
    contents.update('news', item.id, news, 1, 'asha')
    await expect(publishing.publish(undefined, 'admin')).resolves.toMatchObject({ publishedBy: 'admin' })
  })

  it('only one publish at a time', async () => {
    const { contents, publishing } = setup()
    contents.create('news', news, 'asha')
    const first = publishing.publish(undefined, 'admin')
    await expect(publishing.publish(undefined, 'admin')).rejects.toMatchObject({ code: 'PUBLISH_IN_PROGRESS' })
    await first
  })

  it('rollback only moves the pointer', async () => {
    const { files, contents, publishing, store } = setup()
    contents.create('news', news, 'asha')
    const first = await publishing.publish(undefined, 'admin')
    await publishing.publish(undefined, 'admin')
    files.events.length = 0
    await publishing.restore(first.id)
    expect(files.events).toEqual(['put content/current.json'])
    expect(await publishing.currentReleaseId()).toBe(first.id)
    expect(store.listReleases()).toHaveLength(2)
  })

  it('photos must be ready and described before publishing', async () => {
    const { store, contents, publishing } = setup()
    contents.create('news', { ...news, mediaRefs: ['m_gone'] }, 'asha')
    contents.create('news', { ...news, slug: 'two', title: 'Two', mediaRefs: ['m_busy'] }, 'asha')
    contents.create('news', { ...news, slug: 'three', title: 'Three', mediaRefs: ['m_bare'] }, 'asha')
    const asset = { kind: 'image' as const, fileName: 'a.jpg', contentType: 'image/jpeg', sizeBytes: 1, renditions: [], uploadedBy: 'asha', createdAt: '2026-10-01T00:00:00Z' }
    store.saveMedia({ ...asset, id: 'm_busy', status: 'processing' })
    store.saveMedia({ ...asset, id: 'm_bare', status: 'ready' })
    await expect(publishing.publish(undefined, 'admin')).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('was deleted') }),
        expect.objectContaining({ message: expect.stringContaining("isn't ready (processing)") }),
        expect.objectContaining({ message: expect.stringContaining('needs alt text') }),
      ]),
    })
  })

  it('releases in the same second get distinct ids', async () => {
    const { contents, publishing } = setup()
    contents.create('news', news, 'asha')
    const first = await publishing.publish(undefined, 'admin')
    const second = await publishing.publish(undefined, 'admin')
    expect(second.id).toBe(`${first.id}-2`)
  })

  it('an item saved during publishing keeps its newer, unpublished version', async () => {
    const { store, files, contents, publishing } = setup()
    const item = contents.create('news', news, 'asha')
    const original = files.put.bind(files)
    let edited = false
    files.put = async (key, data, type) => {
      if (!edited) {
        edited = true
        contents.update('news', item.id, { ...news, title: 'Edited meanwhile' }, 1, 'ravi')
      }
      return original(key, data, type)
    }
    await publishing.publish(undefined, 'admin')
    expect(store.getItem('news', item.id)).toMatchObject({ version: 2, title: 'Edited meanwhile', status: 'draft' })
  })
})

describe('publish rules (ported from PublishRulesTest)', () => {
  const item = (type: ContentItem['type'], fields: Record<string, unknown>, extra: Partial<ContentItem> = {}): ContentItem => ({
    id: 'x_1', type, slug: 's', title: 'T', fields, mediaRefs: [], status: 'draft', version: 1, updatedBy: 'a', updatedAt: '', ...extra,
  })
  const check = (i: ContentItem) => checkPublishRules(new Map([[i.type, [i]]])).map((p) => p.field.split('.')[1])

  it('a complete publication passes', () => {
    expect(check(item('publication', { category: 'DESIGN', year: 2025, authors: 'A', publishedIn: 'CHI', citation: 'C' }, { body: 'Abstract' }))).toEqual([])
  })

  it('an incomplete publication lists every missing field', () => {
    expect(check(item('publication', { year: 1800 }))).toEqual(['category', 'year', 'authors', 'publishedIn', 'citation', 'body'])
  })

  it('checks the optional publication type, DOI and links when given', () => {
    const complete = { category: 'DESIGN', year: 2025, authors: 'A', publishedIn: 'CHI', citation: 'C' }
    const pub = (extra: Record<string, unknown>) => item('publication', { ...complete, ...extra }, { body: 'Abstract' })
    expect(check(pub({ publicationType: 'conference', doi: '10.1145/3613904.3642000', url: 'https://dl.acm.org/x', pdfUrl: 'https://arxiv.org/pdf/1' }))).toEqual([])
    expect(check(pub({ publicationType: 'blog', doi: 'https://doi.org/10.1145/1', url: 'dl.acm.org/x', pdfUrl: 'ftp://x' })))
      .toEqual(['publicationType', 'doi', 'url', 'pdfUrl'])
  })

  it('a theme needs a type, an icon and a description', () => {
    expect(check(item('theme', { themeType: 'CORE THEME', iconName: 'cat' }))).toEqual(['iconName', 'summary'])
  })

  it('a person needs a group and a role', () => {
    expect(check(item('member', { group: 'visitor' }))).toEqual(['group', 'role'])
  })
})
