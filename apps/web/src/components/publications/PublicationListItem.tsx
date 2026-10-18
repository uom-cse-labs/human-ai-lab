import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { paperLink, publicationType, topicLabel, TYPE_LABELS } from '@/lib/publications'
import type { Publication } from '@/types'
import AuthorList from './AuthorList'
import PublicationThumbnail from './PublicationThumbnail'

/** One publication in the list: type and topic, title, authors, venue, a short abstract and its links. */
export default function PublicationListItem({ publication, labMembers }: { publication: Publication; labMembers: Set<string> }) {
  const link = paperLink(publication)
  const external = 'inline-flex h-11 items-center gap-1.5 rounded-full border border-outline-variant px-4 text-sm font-bold text-on-background transition-colors hover:border-on-background'
  return (
    <li className="flex gap-5 py-8 sm:gap-8">
      <div className="min-w-0 flex-1">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary-light px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
          {TYPE_LABELS[publicationType(publication)]}
        </span>
        <span className="rounded-full border border-outline-variant px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-on-background/70">
          {topicLabel(publication.category)}
        </span>
      </div>
      <h3 className="font-sans text-xl font-black leading-snug tracking-tight text-on-background">
        <Link to="/publications/$id" params={{ id: publication.id }} className="hover:text-primary">
          {publication.title}
        </Link>
      </h3>
      <div className="mt-2">
        <AuthorList authors={publication.authors} labMembers={labMembers} />
      </div>
      <p className="mt-1 text-sm text-on-background/60">
        <em>{publication.publishedIn}</em>, {publication.year}
      </p>
      <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-on-background/80">{publication.abstract}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/publications/$id" params={{ id: publication.id }} className={external}>
          Abstract &amp; citation
        </Link>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className={external}>
            Read paper <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
        {publication.pdfUrl && (
          <a href={publication.pdfUrl} target="_blank" rel="noopener noreferrer" className={external}>
            PDF <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </div>
      </div>
      <Link to="/publications/$id" params={{ id: publication.id }} tabIndex={-1} aria-hidden className="mt-1">
        <PublicationThumbnail publication={publication} className="w-20 transition-opacity hover:opacity-90 sm:w-32 lg:w-40" />
      </Link>
    </li>
  )
}
