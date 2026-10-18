/**
 * Imports the website's built-in content (news Markdown, publications, research themes and people) and
 * publishes it (Java: LocalSeeder). Runs once, on the first start of a new deployment, so the website keeps
 * showing what it showed before the dashboard existed.
 */
import type { ContentService } from './content.ts'
import type { Fields } from './model.ts'
import { DEGREES } from './people.ts'

/** The website's built-in content, bundled into the Worker at build time (scripts/build-seed.mjs). */
export interface SeedBundle {
  /** File name → Markdown with frontmatter */
  news: Record<string, string>
  publications: Record<string, unknown>[]
  themes: Record<string, unknown>[]
  /** data.json: group name → people */
  people: Record<string, Record<string, unknown>[]>
}

export const IMPORT_USER = 'website import'

/** The website's data.json groups, in page order. */
const DATA_GROUPS = ['teamMembers', 'foundingRAs', 'researchAssistants', 'studentResearchers', 'alumni']

/**
 * The academic group for someone in data.json: the first of teamMembers is the director, then research
 * fellows and faculty by their role; founding research assistants are research assistants with the flag.
 */
function academicGroup(dataGroup: string, person: Record<string, unknown>, index: number): Fields {
  const role = `${person.role ?? ''} ${person.title ?? ''}`.toLowerCase()
  switch (dataGroup) {
    case 'teamMembers':
      return { group: index === 0 ? 'director' : role.includes('fellow') ? 'research-fellow' : 'faculty' }
    case 'foundingRAs':
      return { group: 'research-assistant', founding: 'yes' }
    case 'researchAssistants':
      return { group: 'research-assistant' }
    case 'studentResearchers': {
      const degree = DEGREES.find((d) => role.includes(d.toLowerCase()))
      return degree ? { group: 'postgraduate', degree } : { group: 'undergraduate' }
    }
    default:
      return { group: 'alumni' }
  }
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/** Creates every item as a draft; the caller publishes. Returns a summary such as "3 news articles, 5 publications". */
export function importSiteContent(bundle: SeedBundle, contents: ContentService): string {
  const create = (type: Parameters<ContentService['create']>[0], slug: string, title: string, summary: unknown, body: unknown, fields: Fields) =>
    contents.create(type, {
      slug,
      title,
      ...(typeof summary === 'string' ? { summary } : {}),
      ...(typeof body === 'string' ? { body } : {}),
      fields,
      mediaRefs: [],
    }, IMPORT_USER)

  const newsFiles = Object.keys(bundle.news).filter((f) => f.endsWith('.md')).sort()
  for (const file of newsFiles) {
    const { front, body } = parseMarkdown(bundle.news[file])
    const fields: Fields = { date: parseSiteDate(front.date ?? '') }
    putIfPresent(fields, 'imageUrl', front.imageUrl)
    create('news', file.replace(/\.md$/, ''), front.title ?? '', front.content, body, fields)
  }

  bundle.publications.forEach((p, i) => {
    const fields: Fields = {}
    for (const key of ['category', 'authors', 'publishedIn', 'year', 'keyFindings', 'citation', 'imageUrl']) {
      putIfPresent(fields, key, p[key])
    }
    fields.order = i + 1
    create('publication', String(p.id), String(p.title), undefined, p.abstract, fields)
  })

  bundle.themes.forEach((t, i) => {
    const fields: Fields = { themeType: t.type }
    for (const key of ['iconName', 'imageUrl', 'bgClass', 'textClass', 'projects', 'leadResearcher']) {
      putIfPresent(fields, key, t[key])
    }
    fields.order = i + 1
    create('theme', String(t.id), String(t.title), t.description, t.detailedDescription, fields)
  })

  let people = 0
  const usedSlugs = new Set<string>()
  for (const dataGroup of DATA_GROUPS) {
    ;(bundle.people[dataGroup] ?? []).forEach((person, i) => {
      const fields: Fields = { ...academicGroup(dataGroup, person, i), order: i + 1 }
      putIfPresent(fields, 'role', person.role)
      putIfPresent(fields, 'jobTitle', person.title)
      for (const key of ['expertise', 'imageUrl', 'topic', 'period', 'currentPosition']) {
        putIfPresent(fields, key, person[key])
      }
      const socials = person.socials
      if (socials && typeof socials === 'object') {
        for (const key of ['email', 'linkedin', 'scholar']) {
          putIfPresent(fields, key, (socials as Record<string, unknown>)[key])
        }
      }
      const name = String(person.name)
      // Ids aren't shown on the site; a missing or duplicate one becomes an address made from the name.
      const slug = typeof person.id === 'string' && !usedSlugs.has(person.id) ? person.id : slugify(name)
      usedSlugs.add(slug)
      create('member', slug, name, undefined, person.bio, fields)
      people++
    })
  }

  return [
    `${newsFiles.length} news articles`,
    `${bundle.publications.length} publications`,
    `${bundle.themes.length} research themes`,
    `${people} people`,
  ].join(', ')
}

/** Splits "---\nkey: value\n---\nbody" into the frontmatter values and the Markdown body. */
export function parseMarkdown(markdown: string): { front: Record<string, string>; body: string } {
  const parts = markdown.split(/^---\s*$/m)
  const front: Record<string, string> = {}
  for (const line of (parts[1] ?? '').split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*$/)
    if (!match) {
      continue
    }
    const raw = match[2]
    front[match[1]] = raw.startsWith('"') ? JSON.parse(raw) : raw.startsWith("'") ? raw.slice(1, -1).replaceAll("''", "'") : raw
  }
  return { front, body: parts.slice(2).join('---').trim() }
}

/** "AUGUST 18, 2026" → "2026-08-18", as the site writes its dates. */
export function parseSiteDate(value: string): string {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1
  if (!match || month < 0) {
    throw new Error(`Unreadable news date "${value}" (expected e.g. "AUGUST 18, 2026")`)
  }
  return `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function putIfPresent(fields: Fields, key: string, value: unknown) {
  if (value !== undefined && value !== null && !(typeof value === 'string' && !value.trim())) {
    fields[key] = value
  }
}
