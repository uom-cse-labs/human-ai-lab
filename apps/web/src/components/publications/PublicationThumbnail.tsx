import { BookOpen, FileText, GraduationCap, Presentation } from 'lucide-react'
import { publicationType } from '@/lib/publications'
import type { Publication } from '@/types'

/**
 * The publication's image (ideally a figure from the paper), or a plain cover in the lab colour showing
 * the kind of publication, the venue's short name and the year.
 */
export default function PublicationThumbnail({ publication, className }: { publication: Publication; className?: string }) {
  const frame = `aspect-square shrink-0 overflow-hidden rounded-2xl ${className ?? ''}`
  if (publication.imageUrl) {
    return (
      <div className={`${frame} bg-surface-dim`}>
        <img src={publication.imageUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
      </div>
    )
  }
  const type = publicationType(publication)
  const Icon = type === 'conference' || type === 'workshop' ? Presentation : type === 'thesis' ? GraduationCap : type === 'book-chapter' ? BookOpen : FileText
  return (
    <div className={`${frame} flex flex-col justify-between bg-primary-light p-3 text-primary sm:p-4`} aria-hidden>
      <Icon className="size-5" />
      <div>
        <p className="line-clamp-2 font-sans text-sm font-black leading-tight">{venueShortName(publication.publishedIn)}</p>
        <p className="mt-1 font-mono text-xs font-bold">{publication.year}</p>
      </div>
    </div>
  )
}

/** "Moratuwa Engineering Research Conference (MERCon)" → "MERCon"; otherwise the first few words. */
function venueShortName(venue: string): string {
  const acronym = venue.match(/\(([A-Za-z][A-Za-z0-9-]{1,14})\)/)?.[1]
  return acronym ?? venue.split(' ').slice(0, 4).join(' ')
}
