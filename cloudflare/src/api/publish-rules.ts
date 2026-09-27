/**
 * What each content type needs before it can go live (Java: PublishRules). Drafts may be incomplete; these
 * rules run at publish time, and every broken rule is reported so editors can fix everything in one pass.
 */
import type { FieldError } from './errors.ts'
import type { ContentItem } from './model.ts'
import { type Snapshot, text } from './release-files.ts'

export const PUBLICATION_CATEGORIES = ['INTELLIGENCE', 'ETHICS', 'DESIGN', 'ROBOTICS']
export const THEME_TYPES = ['CORE THEME', 'NEW INITIATIVE']
export const THEME_ICONS = ['robot', 'brain', 'shield', 'eye']
export const MEMBER_GROUPS = ['team', 'founding-ra', 'research-assistant', 'student', 'alumni']

export function checkPublishRules(snapshot: Snapshot): FieldError[] {
  const problems: FieldError[] = []
  const add = (item: ContentItem, field: string, message: string) =>
    problems.push({ field: `${item.type}/${item.id}.${field}`, message: `"${item.title}" ${message}` })
  const requireText = (item: ContentItem, field: string, message: string) => {
    if (!text(item, field)) add(item, field, message)
  }
  const requireOneOf = (item: ContentItem, field: string, allowed: string[]) => {
    if (!allowed.includes(text(item, field))) add(item, field, `needs a valid ${field}.`)
  }
  const blank = (value: string | undefined) => !value?.trim()

  for (const item of snapshot.get('news') ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text(item, 'date'))) add(item, 'date', 'needs a date (YYYY-MM-DD).')
  }
  for (const item of snapshot.get('publication') ?? []) {
    requireOneOf(item, 'category', PUBLICATION_CATEGORIES)
    const year = item.fields.year
    if (typeof year !== 'number' || Math.trunc(year) < 1900 || Math.trunc(year) > 2100) add(item, 'year', 'needs a publication year.')
    requireText(item, 'authors', 'needs its authors.')
    requireText(item, 'publishedIn', 'needs the venue or journal it was published in.')
    requireText(item, 'citation', 'needs a citation.')
    if (blank(item.body)) add(item, 'body', 'needs an abstract.')
  }
  for (const item of snapshot.get('theme') ?? []) {
    requireOneOf(item, 'themeType', THEME_TYPES)
    requireOneOf(item, 'iconName', THEME_ICONS)
    if (blank(item.summary)) add(item, 'summary', 'needs a short description.')
  }
  for (const item of snapshot.get('member') ?? []) {
    requireOneOf(item, 'group', MEMBER_GROUPS)
    requireText(item, 'role', 'needs a role.')
  }
  return problems
}
