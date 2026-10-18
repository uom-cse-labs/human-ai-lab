/**
 * How the lab's people are grouped, following academic convention: most senior first, alumni last
 * (contracts/openapi.yaml, PeopleGroup). Members are content items of type "member"; the group is
 * `fields.group`.
 */
import type { ContentItem } from './model.ts'

export const PEOPLE_GROUPS = [
  'director',
  'faculty',
  'research-fellow',
  'postgraduate',
  'research-assistant',
  'undergraduate',
  'alumni',
] as const
export type PeopleGroup = (typeof PEOPLE_GROUPS)[number]

export const DEGREES = ['PhD', 'MPhil', 'MSc']

/** Groups used before academic grouping: "team" mixed the director, faculty and fellows. */
const LEGACY_GROUPS = ['team', 'founding-ra', 'student']

export function isPeopleGroup(value: unknown): value is PeopleGroup {
  return typeof value === 'string' && (PEOPLE_GROUPS as readonly string[]).includes(value)
}

/** The founding flag is "yes" when set in the dashboard, true when imported from older data. */
export function isFounding(item: ContentItem): boolean {
  const value = item.fields.founding
  return value === true || value === 'yes' || value === 'true'
}

/**
 * Members whose group is one of the older groups, rewritten to the academic groups. Unchanged members
 * are left out. Only the group (and the founding flag) changes, so the published site looks the same:
 * - "team": the first by position is the director; anyone whose role or title mentions a fellow is a
 *   research fellow; everyone else is faculty (a director already in the new groups takes precedence).
 * - "founding-ra": a research assistant marked as founding.
 * - "student": a postgraduate researcher if the role names a research degree, otherwise undergraduate.
 */
export function migrateLegacyGroups(members: ContentItem[]): ContentItem[] {
  const legacy = members.filter((m) => LEGACY_GROUPS.includes(String(m.fields.group)))
  if (!legacy.length) {
    return []
  }
  const hasDirector = members.some((m) => m.fields.group === 'director')
  const team = legacy.filter((m) => m.fields.group === 'team').sort(byPosition)
  const director = hasDirector ? undefined : team[0]

  return legacy.map((m) => {
    const fields = { ...m.fields }
    if (fields.group === 'team') {
      const text = `${fields.role ?? ''} ${fields.jobTitle ?? ''}`.toLowerCase()
      fields.group = m === director ? 'director' : text.includes('fellow') ? 'research-fellow' : 'faculty'
    } else if (fields.group === 'founding-ra') {
      fields.group = 'research-assistant'
      fields.founding = 'yes'
    } else {
      const degree = DEGREES.find((d) => String(fields.role ?? '').toLowerCase().includes(d.toLowerCase()))
      fields.group = degree ? 'postgraduate' : 'undergraduate'
      if (degree && !fields.degree) {
        fields.degree = degree
      }
    }
    return { ...m, fields }
  })
}

/** Display order within a group: by the editor's position, then by name. */
export function byPosition(a: ContentItem, b: ContentItem): number {
  const position = (i: ContentItem) => (typeof i.fields.order === 'number' ? i.fields.order : Number.MAX_VALUE)
  return position(a) - position(b) || (a.title < b.title ? -1 : a.title > b.title ? 1 : 0)
}

/** Page order: by group (most senior first), then by position within the group. */
export function byGroupAndPosition(a: ContentItem, b: ContentItem): number {
  const rank = (i: ContentItem) => {
    const index = PEOPLE_GROUPS.indexOf(i.fields.group as PeopleGroup)
    return index < 0 ? PEOPLE_GROUPS.length : index
  }
  return rank(a) - rank(b) || byPosition(a, b)
}
