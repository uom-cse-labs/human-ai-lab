import type { ContentItem, ContentTypeKey } from './api/client.ts'

/**
 * Collections editable through the generic editor. Each field says where it lives on the content item
 * (title, summary, body, or a named entry in `fields`) and how to edit it.
 */

export type FieldKind = 'text' | 'textarea' | 'url' | 'number' | 'select' | 'lines' | 'cardStyle' | 'image'

export type FormValues = Record<string, string>

export interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  /** title, summary and body are item properties; anything else is stored in item.fields[key]. */
  target?: 'title' | 'summary' | 'body' | 'fields'
  required?: boolean
  help?: string
  placeholder?: string
  rows?: number
  options?: { value: string; label: string }[]
  /** Show only when this returns true (e.g. alumni-only fields). */
  showWhen?: (values: FormValues) => boolean
  wide?: boolean
}

export interface ListColumn {
  label: string
  value: (item: ContentItem) => string
}

export interface CollectionDef {
  type: ContentTypeKey
  path: string
  label: string
  singular: string
  description: string
  /** The public page this collection appears on. */
  websitePath: string
  titleLabel: string
  fields: FieldDef[]
  columns: ListColumn[]
  /** Order in the list view. */
  sort: (a: ContentItem, b: ContentItem) => number
  defaults: FormValues
}

export const field = (item: ContentItem, key: string): string => {
  const value = item.fields?.[key]
  if (Array.isArray(value)) return value.join('\n')
  return value === undefined || value === null ? '' : String(value)
}

const byOrder = (a: ContentItem, b: ContentItem) =>
  Number(a.fields?.order ?? Infinity) - Number(b.fields?.order ?? Infinity) || a.title.localeCompare(b.title)

/** The four colour schemes the website's theme cards were designed with. */
export const CARD_STYLES = [
  { value: 'charcoal', label: 'Charcoal, white text', bgClass: 'bg-stone-900', textClass: 'text-white' },
  { value: 'cream', label: 'Cream, dark text', bgClass: 'bg-[#faf3e5]', textClass: 'text-[#1e1b13]' },
  { value: 'sand', label: 'Sand, brown text', bgClass: 'bg-[#f5e1aa]', textClass: 'text-[#52461d]' },
  { value: 'black', label: 'Black, white text', bgClass: 'bg-stone-950', textClass: 'text-white' },
]

const ORDER: FieldDef = {
  key: 'order',
  label: 'Position',
  kind: 'number',
  help: 'Lower numbers appear first on the website.',
}

/** Academic grouping, most senior first: the order of the sections on the People page. */
export const PEOPLE_GROUPS = [
  { value: 'director', label: 'Director' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'research-fellow', label: 'Research fellows' },
  { value: 'postgraduate', label: 'Postgraduate researchers (PhD, MPhil, MSc)' },
  { value: 'research-assistant', label: 'Research assistants' },
  { value: 'undergraduate', label: 'Undergraduate researchers' },
  { value: 'alumni', label: 'Alumni' },
]

/** Everyone currently in the lab, as opposed to alumni. */
const CURRENT = ['director', 'faculty', 'research-fellow', 'postgraduate', 'research-assistant', 'undergraduate']

const inGroups = (...groups: string[]) => (v: FormValues) => groups.includes(v.group)

export const COLLECTIONS: CollectionDef[] = [
  {
    type: 'publication',
    path: '/publications',
    label: 'Publications',
    singular: 'publication',
    description: 'Papers on the Publications page and the homepage.',
    websitePath: '/publications',
    titleLabel: 'Title',
    defaults: { category: 'INTELLIGENCE', year: String(new Date().getFullYear()) },
    sort: byOrder,
    columns: [
      { label: 'Year', value: (i) => field(i, 'year') },
      { label: 'Category', value: (i) => field(i, 'category') },
    ],
    fields: [
      { key: 'category', label: 'Category', kind: 'select', required: true, options: ['INTELLIGENCE', 'ETHICS', 'DESIGN', 'ROBOTICS'].map((c) => ({ value: c, label: c.charAt(0) + c.slice(1).toLowerCase() })) },
      { key: 'year', label: 'Year', kind: 'number', required: true },
      { key: 'authors', label: 'Authors', kind: 'text', required: true, wide: true, placeholder: 'A. Author, B. Author' },
      { key: 'publishedIn', label: 'Published in', kind: 'text', required: true, wide: true, placeholder: 'Journal or conference' },
      { key: 'publicationType', label: 'Type', kind: 'select', options: [{ value: '', label: 'Work it out from the venue' }, { value: 'journal', label: 'Journal article' }, { value: 'conference', label: 'Conference paper' }, { value: 'workshop', label: 'Workshop paper' }, { value: 'book-chapter', label: 'Book chapter' }, { value: 'thesis', label: 'Thesis' }, { value: 'preprint', label: 'Preprint' }, { value: 'report', label: 'Technical report' }] },
      { key: 'doi', label: 'DOI', kind: 'text', placeholder: '10.1145/1234567', help: 'Without https://doi.org/.' },
      { key: 'url', label: 'Paper link', kind: 'url', wide: true, placeholder: 'https://dl.acm.org/doi/…', help: "The paper on the publisher's site." },
      { key: 'pdfUrl', label: 'PDF link', kind: 'url', wide: true, help: 'A freely available copy, e.g. on arXiv or the university repository.' },
      { key: 'body', target: 'body', label: 'Abstract', kind: 'textarea', rows: 6, required: true, wide: true },
      { key: 'keyFindings', label: 'Key findings', kind: 'lines', rows: 4, wide: true, help: 'One finding per line.' },
      { key: 'citation', label: 'Citation', kind: 'textarea', rows: 3, required: true, wide: true },
      { key: 'imageUrl', label: 'Image', kind: 'image', wide: true },
      ORDER,
    ],
  },
  {
    type: 'theme',
    path: '/themes',
    label: 'Research themes',
    singular: 'research theme',
    description: 'Themes on the Research Themes page. The homepage shows the first four.',
    websitePath: '/themes',
    titleLabel: 'Theme name',
    defaults: { themeType: 'CORE THEME', iconName: 'brain', cardStyle: 'charcoal' },
    sort: byOrder,
    columns: [
      { label: 'Type', value: (i) => field(i, 'themeType') },
      { label: 'Position', value: (i) => field(i, 'order') },
    ],
    fields: [
      { key: 'themeType', label: 'Type', kind: 'select', required: true, options: [{ value: 'CORE THEME', label: 'Core theme' }, { value: 'NEW INITIATIVE', label: 'New initiative' }] },
      { key: 'iconName', label: 'Icon', kind: 'select', required: true, options: [{ value: 'robot', label: 'Robot' }, { value: 'brain', label: 'Brain' }, { value: 'shield', label: 'Shield' }, { value: 'eye', label: 'Eye' }] },
      { key: 'summary', target: 'summary', label: 'Short description', kind: 'textarea', rows: 3, required: true, wide: true, help: 'Shown on the theme card.' },
      { key: 'body', target: 'body', label: 'Detailed description', kind: 'textarea', rows: 8, wide: true, help: 'Shown on the Research Themes page.' },
      { key: 'leadResearcher', label: 'Lead researcher', kind: 'text' },
      { key: 'cardStyle', label: 'Card colours', kind: 'cardStyle', help: 'Used when the theme has no image.' },
      { key: 'projects', label: 'Projects', kind: 'lines', rows: 4, wide: true, help: 'One project per line.' },
      { key: 'imageUrl', label: 'Image', kind: 'image', wide: true, help: 'Shown on the theme card instead of the card colours.' },
      ORDER,
    ],
  },
  {
    type: 'member',
    path: '/people',
    label: 'People',
    singular: 'person',
    description: 'Everyone on the People page, grouped as in academia: director, faculty, research fellows, postgraduate and undergraduate researchers, research assistants and alumni.',
    websitePath: '/people',
    titleLabel: 'Name',
    defaults: { group: 'faculty' },
    sort: (a, b) =>
      PEOPLE_GROUPS.findIndex((g) => g.value === field(a, 'group')) - PEOPLE_GROUPS.findIndex((g) => g.value === field(b, 'group')) ||
      byOrder(a, b),
    columns: [
      { label: 'Group', value: (i) => PEOPLE_GROUPS.find((g) => g.value === field(i, 'group'))?.label ?? field(i, 'group') },
      { label: 'Role', value: (i) => field(i, 'role') },
    ],
    fields: [
      { key: 'group', label: 'Group', kind: 'select', required: true, options: PEOPLE_GROUPS, help: 'Sections on the People page, most senior first. Only one person can be the director.' },
      ORDER,
      { key: 'role', label: 'Position', kind: 'text', required: true, wide: true, placeholder: 'e.g. Senior Lecturer, PhD Student or Undergraduate Researcher, CSE' },
      { key: 'degree', label: 'Degree', kind: 'select', required: true, showWhen: inGroups('postgraduate'), options: [{ value: '', label: 'Choose…' }, { value: 'PhD', label: 'PhD' }, { value: 'MPhil', label: 'MPhil' }, { value: 'MSc', label: 'MSc (research)' }] },
      { key: 'startYear', label: 'Started in', kind: 'number', showWhen: inGroups('postgraduate'), placeholder: '2025' },
      { key: 'supervisor', label: 'Supervisor', kind: 'text', wide: true, showWhen: inGroups('postgraduate'), placeholder: 'Prof. Indika Perera' },
      { key: 'founding', label: 'Founding member', kind: 'select', showWhen: inGroups('research-assistant'), options: [{ value: '', label: 'No' }, { value: 'yes', label: 'Yes, joined when the lab was founded' }] },
      { key: 'jobTitle', label: 'Title on profile card', kind: 'text', wide: true, showWhen: inGroups('director', 'faculty', 'research-fellow', 'research-assistant') },
      { key: 'body', target: 'body', label: 'Biography', kind: 'textarea', rows: 6, wide: true, showWhen: inGroups('director', 'faculty', 'research-fellow', 'postgraduate', 'research-assistant') },
      { key: 'expertise', label: 'Research interests', kind: 'text', wide: true, showWhen: inGroups('director', 'faculty', 'research-fellow', 'postgraduate', 'research-assistant'), placeholder: 'e.g. Human-computer interaction, software engineering' },
      { key: 'imageUrl', label: 'Photo', kind: 'image', wide: true, showWhen: inGroups(...CURRENT) },
      { key: 'topic', label: 'Research topic', kind: 'text', wide: true, showWhen: inGroups('postgraduate', 'undergraduate') },
      { key: 'period', label: 'Period', kind: 'text', showWhen: inGroups('alumni'), placeholder: '2022 – 2024' },
      { key: 'currentPosition', label: 'Current position', kind: 'text', wide: true, showWhen: inGroups('alumni') },
      { key: 'email', label: 'Email link', kind: 'text', placeholder: 'mailto:name@cse.mrt.ac.lk' },
      { key: 'linkedin', label: 'LinkedIn URL', kind: 'url' },
      { key: 'scholar', label: 'Google Scholar URL', kind: 'url' },
    ],
  },
]
