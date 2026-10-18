import type { Publication } from '@/types'
import PublicationListItem from './PublicationListItem'

/** The publications of one year, under a year heading (newest years first). */
export default function PublicationYearGroup({ year, publications, labMembers }: {
  year: number
  publications: Publication[]
  labMembers: Set<string>
}) {
  return (
    <section aria-labelledby={`year-${year}`} className="border-t border-outline-variant pt-6 first:border-t-0 first:pt-0">
      <h2 id={`year-${year}`} className="font-mono text-sm font-bold uppercase tracking-widest text-on-background/50">
        {year}
      </h2>
      <ul className="divide-y divide-outline-variant">
        {publications.map((p) => (
          <PublicationListItem key={p.id} publication={p} labMembers={labMembers} />
        ))}
      </ul>
    </section>
  )
}
