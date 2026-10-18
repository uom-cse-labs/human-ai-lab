/**
 * Imports the website's real built-in content, publishes it, and checks the release files match the website's
 * original data exactly (ported from SiteContentRoundTripTest). This is what lets the website switch to
 * releases with no visible change.
 */
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { ContentService } from '../../src/api/content.ts'
import { PublishService } from '../../src/api/publishing.ts'
import { importSiteContent, type SeedBundle } from '../../src/api/seed.ts'
import { MemoryFiles, MemoryStore } from '../../src/api/store.ts'
import seed from '../../src/seed.gen.json'

const site = (path: string) => JSON.parse(readFileSync(new URL(`../../../apps/web/src/${path}`, import.meta.url), 'utf8'))
const published: Record<string, any> = {}
let summary = ''

beforeAll(async () => {
  const store = new MemoryStore()
  const files = new MemoryFiles()
  const contents = new ContentService(store)
  summary = importSiteContent(seed as SeedBundle, contents)
  const release = await new PublishService(store, files).publish(undefined, 'website import')
  for (const name of ['news', 'publications', 'themes', 'members']) {
    published[name] = files.json(`content/releases/${release.id}/${name}.json`)
  }
})

describe('the site content round trip', () => {
  it('imports everything', () => {
    expect(summary).toBe('3 news articles, 5 publications, 4 research themes, 20 people')
  })

  it('publications match the website', () => {
    expect(published.publications.items).toStrictEqual(site('content/publications.json'))
  })

  it('research themes match the website', () => {
    expect(published.themes.items).toStrictEqual(site('content/themes.json'))
  })

  it('people match the website', () => {
    const original = site('data.json')
    const ids = new Set<string>()
    for (const group of ['teamMembers', 'foundingRAs', 'researchAssistants', 'studentResearchers', 'alumni']) {
      // Ids are internal (React keys), and the original data has a duplicate, so every person gets a unique
      // id; everything visitors see must match exactly.
      const actual = published.members[group].map(({ id, ...person }: { id: string }) => {
        expect(ids.has(id), `unique id ${id}`).toBe(false)
        ids.add(id)
        return person
      })
      const expected = original[group].map(({ id: _id, ...person }: { id?: string }) => person)
      expect(actual, group).toStrictEqual(expected)
    }
  })

  it('news keeps every article, newest first', () => {
    const items = published.news.items
    expect(items).toHaveLength(3)
    const dates = items.map((n: { date: string }) => n.date)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(items[0]).toMatchObject({ slug: 'humanai-explores-ai-powered-robotic-automation-coffee-robotic-arm', date: '2026-08-25' })
    expect(items[0].cover).toEqual({ src: 'https://snipboard.io/TABRn2.jpg', alt: items[0].title })
    expect(items[0].body).toMatch(/^Under the guidance/)
  })

  it('publishes the publication type and links when set', async () => {
    const store = new MemoryStore()
    const files = new MemoryFiles()
    const contents = new ContentService(store)
    contents.create('publication', {
      slug: 'p', title: 'P', body: 'Abstract', mediaRefs: [],
      fields: { category: 'DESIGN', year: 2025, authors: 'A', publishedIn: 'CHI', citation: 'C', publicationType: 'conference', doi: '10.1145/1', pdfUrl: 'https://arxiv.org/pdf/1' },
    }, 'asha')
    const release = await new PublishService(store, files).publish(undefined, 'admin')
    const [pub] = (files.json(`content/releases/${release.id}/publications.json`) as { items: Record<string, unknown>[] }).items
    expect(pub).toMatchObject({ type: 'conference', doi: '10.1145/1', pdfUrl: 'https://arxiv.org/pdf/1' })
    expect(pub).not.toHaveProperty('url')
  })
})
