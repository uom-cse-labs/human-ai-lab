/**
 * Turns a snapshot into the release files the website reads, in the shapes defined by the contract
 * (Java: ReleaseFiles). Release files never contain nulls: the website treats a missing field and null
 * differently, so absent values are left out.
 */
import type { components } from '@hai/content-schema'
import type { ContentItem, ContentType } from './model.ts'

type Schemas = components['schemas']
export type Snapshot = Map<ContentType, ContentItem[]>

export function releaseFiles(snapshot: Snapshot): Record<string, unknown> {
  const of = (type: ContentType) => snapshot.get(type) ?? []
  return {
    'news.json': news(of('news')),
    'publications.json': publications(of('publication')),
    'themes.json': themes(of('theme')),
    'members.json': members(of('member')),
  }
}

function news(items: ContentItem[]): Schemas['PublishedNewsFile'] {
  const published = items.map((n): Schemas['PublishedNewsItem'] => {
    const image = text(n, 'imageUrl')
    return compact({
      id: n.id,
      slug: n.slug,
      title: n.title,
      date: text(n, 'date'),
      summary: n.summary,
      body: n.body,
      cover: image ? { src: image, alt: n.title } : undefined,
    })
  })
  // Newest first; a stable sort keeps same-day articles in their stored order.
  published.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return { schema: 1, items: published }
}

function publications(items: ContentItem[]): Schemas['PublishedPublicationsFile'] {
  return {
    schema: 1,
    items: ordered(items).map((p) => compact({
      id: p.slug,
      title: p.title,
      category: text(p, 'category') as Schemas['PublishedPublication']['category'],
      authors: text(p, 'authors'),
      publishedIn: text(p, 'publishedIn'),
      year: Math.trunc(p.fields.year as number),
      abstract: p.body as string,
      keyFindings: list(p, 'keyFindings'),
      citation: text(p, 'citation'),
      imageUrl: optional(p, 'imageUrl'),
    })),
  }
}

function themes(items: ContentItem[]): Schemas['PublishedThemesFile'] {
  return {
    schema: 1,
    items: ordered(items).map((t) => compact({
      id: t.slug,
      title: t.title,
      type: text(t, 'themeType') as Schemas['PublishedTheme']['type'],
      description: t.summary as string,
      iconName: text(t, 'iconName') as Schemas['PublishedTheme']['iconName'],
      imageUrl: optional(t, 'imageUrl'),
      bgClass: text(t, 'bgClass'),
      textClass: text(t, 'textClass'),
      detailedDescription: t.body ?? '',
      projects: list(t, 'projects'),
      leadResearcher: text(t, 'leadResearcher'),
    })),
  }
}

function members(items: ContentItem[]): Schemas['PublishedMembersFile'] {
  const sorted = ordered(items)
  return {
    schema: 1,
    teamMembers: group(sorted, 'team'),
    foundingRAs: group(sorted, 'founding-ra'),
    researchAssistants: group(sorted, 'research-assistant'),
    studentResearchers: group(sorted, 'student'),
    alumni: group(sorted, 'alumni'),
  }
}

function group(items: ContentItem[], name: string): Schemas['PublishedPerson'][] {
  return items.filter((m) => text(m, 'group') === name).map((m) => {
    const socials = compact({ email: optional(m, 'email'), linkedin: optional(m, 'linkedin'), scholar: optional(m, 'scholar') })
    return compact({
      id: m.slug,
      name: m.title,
      role: text(m, 'role'),
      title: optional(m, 'jobTitle'),
      bio: m.body?.trim() ? m.body : undefined,
      expertise: optional(m, 'expertise'),
      imageUrl: optional(m, 'imageUrl'),
      topic: optional(m, 'topic'),
      period: optional(m, 'period'),
      currentPosition: optional(m, 'currentPosition'),
      socials: Object.keys(socials).length ? socials : undefined,
    })
  })
}

/** Editors set the display order with the "order" field; ties fall back to the title. */
function ordered(items: ContentItem[]): ContentItem[] {
  const order = (i: ContentItem) => (typeof i.fields.order === 'number' ? i.fields.order : Number.MAX_VALUE)
  return [...items].sort((a, b) => order(a) - order(b) || (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))
}

/** A trimmed text field, or "" if missing or not text (Java: PublishRules.text). */
export function text(item: ContentItem, field: string): string {
  const value = item.fields[field]
  return typeof value === 'string' ? value.trim() : ''
}

function optional(item: ContentItem, field: string): string | undefined {
  return text(item, field) || undefined
}

function list(item: ContentItem, field: string): string[] {
  const value = item.fields[field]
  return Array.isArray(value) ? value.map((v) => String(v).trim()).filter((v) => v !== '') : []
}

/** Drops undefined and null properties. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as T
}
