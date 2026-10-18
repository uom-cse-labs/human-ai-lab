/**
 * Turns a snapshot into the release files the website reads, in the shapes defined by the contract
 * (Java: ReleaseFiles). Release files never contain nulls: the website treats a missing field and null
 * differently, so absent values are left out.
 */
import type { components } from '@hai/content-schema'
import type { ContentItem, ContentType } from './model.ts'
import { byGroupAndPosition, byPosition, isFounding, isPeopleGroup, migrateLegacyGroups, type PeopleGroup } from './people.ts'

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
      type: optional(p, 'publicationType') as Schemas['PublishedPublication']['type'],
      doi: optional(p, 'doi'),
      url: optional(p, 'url'),
      pdfUrl: optional(p, 'pdfUrl'),
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
  // Older entries still on legacy groups are published as their academic group.
  const migrated = new Map(migrateLegacyGroups(items).map((m) => [m.id, m]))
  const all = items.map((m) => migrated.get(m.id) ?? m)
  const inGroups = (...groups: PeopleGroup[]) => all.filter((m) => groups.includes(m.fields.group as PeopleGroup)).sort(byPosition)
  const assistants = inGroups('research-assistant')
  return {
    schema: 1,
    // The lists earlier website versions read (same shape as the website's data.json).
    teamMembers: inGroups('director', 'faculty', 'research-fellow').map(person),
    foundingRAs: assistants.filter(isFounding).map(person),
    researchAssistants: assistants.filter((m) => !isFounding(m)).map(person),
    studentResearchers: inGroups('postgraduate', 'undergraduate').map(person),
    alumni: inGroups('alumni').map(person),
    // Everyone, with their academic group, in page order.
    people: all.filter((m) => isPeopleGroup(m.fields.group)).sort(byGroupAndPosition).map((m) => compact({
      ...person(m),
      group: m.fields.group as PeopleGroup,
      degree: optional(m, 'degree') as Schemas['PublishedPerson']['degree'],
      startYear: typeof m.fields.startYear === 'number' ? Math.trunc(m.fields.startYear) : undefined,
      supervisor: optional(m, 'supervisor'),
      founding: isFounding(m) || undefined,
    })),
  }
}

function person(m: ContentItem): Schemas['PublishedPerson'] {
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
