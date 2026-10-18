import type { Publication } from '@/types'

export type PublicationType = NonNullable<Publication['type']>

export const TYPE_LABELS: Record<PublicationType, string> = {
  journal: 'Journal article',
  conference: 'Conference paper',
  workshop: 'Workshop paper',
  'book-chapter': 'Book chapter',
  thesis: 'Thesis',
  preprint: 'Preprint',
  report: 'Technical report',
}

/** The editor's choice, or worked out from the venue name ("…Conference…" is a conference paper). */
export function publicationType(p: Publication): PublicationType {
  if (p.type) {
    return p.type
  }
  const venue = p.publishedIn.toLowerCase()
  if (venue.includes('workshop')) return 'workshop'
  if (/conference|proceedings|symposium|congress/.test(venue)) return 'conference'
  if (/arxiv|preprint/.test(venue)) return 'preprint'
  if (/thesis|dissertation/.test(venue)) return 'thesis'
  return 'journal'
}

/** "Intelligence" for the category INTELLIGENCE, and so on. */
export function topicLabel(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase()
}

/** Where to read the paper: its DOI, else the publisher link. */
export function paperLink(p: Publication): string | undefined {
  return p.doi ? `https://doi.org/${p.doi}` : p.url
}

/** "A, B and C" → ["A", "B", "C"]. */
export function splitAuthors(authors: string): string[] {
  return authors.split(/\s*,\s*|\s+and\s+|\s*&\s*/).map((a) => a.trim()).filter(Boolean)
}

/** A name without titles, for matching authors to lab members: "Prof. Indika Perera" → "indika perera". */
export function plainName(name: string): string {
  return name
    .replace(/^(eng\.?\s+)?(prof|dr|mr|ms|mrs)\.?\s+/i, '')
    .replace(/^(prof|dr)\.?\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** A BibTeX entry, so researchers can cite the paper in LaTeX. */
export function bibtex(p: Publication): string {
  const type = publicationType(p)
  const entry = { journal: 'article', conference: 'inproceedings', workshop: 'inproceedings', 'book-chapter': 'incollection', thesis: 'phdthesis', preprint: 'misc', report: 'techreport' }[type]
  const venueField = { journal: 'journal', conference: 'booktitle', workshop: 'booktitle', 'book-chapter': 'booktitle', thesis: 'school', preprint: 'howpublished', report: 'institution' }[type]
  const authors = splitAuthors(p.authors)
  const surname = (authors[0] ?? 'anon').split(' ').pop()!.toLowerCase().replace(/[^a-z]/g, '')
  const firstWord = p.title.toLowerCase().split(/\W+/).find((w) => w.length > 3) ?? 'paper'
  const fields: [string, string | number | undefined][] = [
    ['title', `{${p.title}}`],
    ['author', authors.join(' and ')],
    [venueField, p.publishedIn],
    ['year', p.year],
    ['doi', p.doi],
    ['url', p.doi ? undefined : p.url],
  ]
  const body = fields
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `  ${key} = {${value}}`)
    .join(',\n')
  return `@${entry}{${surname}${p.year}${firstWord},\n${body}\n}`
}
