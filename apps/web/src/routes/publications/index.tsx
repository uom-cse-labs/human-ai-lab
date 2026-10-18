import { createFileRoute } from '@tanstack/react-router'
import { titled } from '@/lib/title'
import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import FilterGroup, { type FilterChoice } from '@/components/publications/FilterGroup'
import PublicationYearGroup from '@/components/publications/PublicationYearGroup'
import { usePeopleDirectory, usePublications } from '@/lib/content'
import { plainName, publicationType, topicLabel, TYPE_LABELS } from '@/lib/publications'
import type { Publication } from '@/types'

interface PublicationsSearch {
  q?: string
  topic?: string
  type?: string
  year?: number
  /** Set by the header's search icon: focus the search box. */
  openSearch?: boolean
}

export const Route = createFileRoute('/publications/')({
  head: titled('Publications'),
  validateSearch: (search: Record<string, unknown>): PublicationsSearch => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
    topic: typeof search.topic === 'string' ? search.topic : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
    year: Number.isInteger(Number(search.year)) && search.year !== undefined ? Number(search.year) : undefined,
    openSearch: search.openSearch === true || search.openSearch === 'true' ? true : undefined,
  }),
  component: PublicationsPage,
})

/**
 * Every publication, newest first and grouped by year, with search and filters by topic, type and year
 * (after hai.stanford.edu/research/publications). Filters live in the address, so a filtered list can be
 * shared.
 */
function PublicationsPage() {
  const { status, publications } = usePublications()
  const { directory } = usePeopleDirectory()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const searchBox = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (search.openSearch) {
      searchBox.current?.focus()
      searchBox.current?.scrollIntoView({ block: 'center' })
      navigate({ search: (prev) => ({ ...prev, openSearch: undefined }), replace: true })
    }
  }, [search.openSearch, navigate])

  const labMembers = useMemo(() => {
    const { director, faculty, fellows, postgraduates, assistants, undergraduates, alumni } = directory
    return new Set([director, ...faculty, ...fellows, ...postgraduates, ...assistants, ...undergraduates, ...alumni]
      .filter(Boolean)
      .map((p) => plainName(p!.name)))
  }, [directory])

  const set = (changes: Partial<PublicationsSearch>) => navigate({ search: (prev) => ({ ...prev, ...changes }), replace: true })

  const matches = (p: Publication, ignore?: keyof PublicationsSearch) => {
    const q = search.q?.toLowerCase().trim()
    return (
      (!q || [p.title, p.authors, p.publishedIn, p.abstract].some((text) => text.toLowerCase().includes(q))) &&
      (ignore === 'topic' || !search.topic || p.category === search.topic) &&
      (ignore === 'type' || !search.type || publicationType(p) === search.type) &&
      (ignore === 'year' || !search.year || p.year === search.year)
    )
  }

  const results = publications.filter((p) => matches(p)).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  const years = [...new Set(results.map((p) => p.year))]

  /** Choices for one filter, counted against the other filters so the numbers match what you'd get. */
  const choices = (key: 'topic' | 'type' | 'year', valueOf: (p: Publication) => string, labelOf: (value: string) => string): FilterChoice[] => {
    const counts = new Map<string, number>()
    for (const p of publications.filter((p) => matches(p, key))) {
      counts.set(valueOf(p), (counts.get(valueOf(p)) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: labelOf(value), count }))
      .sort((a, b) => (key === 'year' ? Number(b.value) - Number(a.value) : a.label.localeCompare(b.label)))
  }
  const filtered = Boolean(search.q || search.topic || search.type || search.year)

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24">
      <header className="pb-10 pt-16 md:pt-24">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Research</span>
        <h1 className="mt-3 font-sans text-4xl font-black tracking-tight text-on-background md:text-6xl">Publications</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-background/70">
          Peer-reviewed research by members of the Human-AI Lab. Lab members are shown in bold.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3" aria-label="Search and filters">
          <div className="space-y-5 lg:sticky lg:top-28">
            <label htmlFor="search" className="relative block">
              <span className="sr-only">Search publications</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-on-background/50" aria-hidden />
              <input
                id="search"
                ref={searchBox}
                type="search"
                value={search.q ?? ''}
                onChange={(e) => set({ q: e.target.value || undefined })}
                placeholder="Title, author or venue"
                className="h-12 w-full rounded-full border border-outline-variant bg-background pl-11 pr-4 text-sm text-on-background outline-none transition-colors focus:border-on-background"
              />
            </label>
            <FilterGroup title="Topic" choices={choices('topic', (p) => p.category, topicLabel)} selected={search.topic} onChange={(topic) => set({ topic })} />
            <FilterGroup
              title="Type"
              choices={choices('type', (p) => publicationType(p), (t) => TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t)}
              selected={search.type}
              onChange={(type) => set({ type })}
            />
            <FilterGroup
              title="Year"
              choices={choices('year', (p) => String(p.year), (y) => y)}
              selected={search.year ? String(search.year) : undefined}
              onChange={(year) => set({ year: year ? Number(year) : undefined })}
            />
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-on-background/60" aria-live="polite">
              {status === 'loading' && !publications.length ? '\u00a0' : `${results.length} ${results.length === 1 ? 'publication' : 'publications'}`}
            </p>
            {filtered && (
              <button
                type="button"
                onClick={() => set({ q: undefined, topic: undefined, type: undefined, year: undefined })}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-on-background/70 hover:text-on-background"
              >
                <X className="size-4" aria-hidden /> Clear all
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <p className="py-16 text-center text-on-background/60">
              {status === 'loading'
                ? 'Loading publications…'
                : status === 'error'
                  ? 'Publications could not be loaded. Please refresh the page.'
                  : 'No publications match. Try fewer filters or another search.'}
            </p>
          ) : (
            <div className="space-y-6">
              {years.map((year) => (
                <PublicationYearGroup key={year} year={year} publications={results.filter((p) => p.year === year)} labMembers={labMembers} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
