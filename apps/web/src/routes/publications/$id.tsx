import { createFileRoute, Link } from '@tanstack/react-router'
import { pageTitle } from '@/lib/title'
import { publicationTitle } from '@/lib/titles'
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'
import AuthorList from '@/components/publications/AuthorList'
import CopyBlock from '@/components/publications/CopyBlock'
import { usePeopleDirectory, usePublications } from '@/lib/content'
import { bibtex, paperLink, plainName, publicationType, topicLabel, TYPE_LABELS } from '@/lib/publications'

export const Route = createFileRoute('/publications/$id')({
  loader: async ({ params }) => ({ title: await publicationTitle(params.id) }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.title ?? 'Publications') }] }),
  component: PublicationPage,
})

/** One publication: its own address, abstract, key findings and ready-to-copy citations. */
function PublicationPage() {
  const { id } = Route.useParams()
  const { status, publications } = usePublications()
  const { directory } = usePeopleDirectory()
  const publication = publications.find((p) => p.id === id)

  const labMembers = useMemo(() => {
    const { director, faculty, fellows, postgraduates, assistants, undergraduates, alumni } = directory
    return new Set([director, ...faculty, ...fellows, ...postgraduates, ...assistants, ...undergraduates, ...alumni]
      .filter(Boolean)
      .map((p) => plainName(p!.name)))
  }, [directory])

  if (!publication) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-on-background/70">{status === 'loading' ? 'Loading…' : 'This publication could not be found.'}</p>
        <Link to="/publications" className="mt-6 inline-flex h-12 items-center rounded-full border border-outline px-6 font-bold">
          All publications
        </Link>
      </div>
    )
  }

  const link = paperLink(publication)
  const action = 'inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold transition-colors'

  return (
    <article className="mx-auto max-w-4xl px-6 pb-24 pt-12 md:pt-16">
      <Link to="/publications" className="group inline-flex h-11 items-center gap-2 text-sm font-bold text-on-background/70 hover:text-on-background">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> All publications
      </Link>

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary-light px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
          {TYPE_LABELS[publicationType(publication)]}
        </span>
        <Link
          to="/publications"
          search={{ topic: publication.category }}
          className="rounded-full border border-outline-variant px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-on-background/70 hover:border-on-background"
        >
          {topicLabel(publication.category)}
        </Link>
      </div>

      <h1 className="mt-5 font-sans text-3xl font-black leading-tight tracking-tight text-on-background md:text-5xl">{publication.title}</h1>
      <div className="mt-5 text-base">
        <AuthorList authors={publication.authors} labMembers={labMembers} />
      </div>
      <p className="mt-2 text-sm text-on-background/60">
        <em>{publication.publishedIn}</em>, {publication.year}
        {publication.doi && <> · DOI {publication.doi}</>}
      </p>

      {(link || publication.pdfUrl) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`${action} bg-primary text-white hover:bg-primary-hover`}>
              Read the paper <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
          {publication.pdfUrl && (
            <a href={publication.pdfUrl} target="_blank" rel="noopener noreferrer" className={`${action} border border-outline text-on-background hover:border-on-background`}>
              PDF <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
      )}

      {publication.imageUrl && (
        <img
          src={publication.imageUrl}
          alt=""
          className="mt-10 aspect-video w-full rounded-3xl object-cover"
          referrerPolicy="no-referrer"
        />
      )}

      <section className="mt-12">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-on-background/60">Abstract</h2>
        <p className="mt-4 text-lg leading-relaxed text-on-background/90">{publication.abstract}</p>
      </section>

      {publication.keyFindings.length > 0 && (
        <section className="mt-10 rounded-3xl border border-outline-variant bg-surface p-6 sm:p-8">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-on-background/60">Key findings</h2>
          <ul className="mt-4 space-y-3">
            {publication.keyFindings.map((finding) => (
              <li key={finding} className="flex gap-3 text-base leading-relaxed text-on-background/90">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                {finding}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="cite" className="mt-12 space-y-8">
        <h2 className="font-sans text-2xl font-black tracking-tight text-on-background">Cite this work</h2>
        {publication.citation && <CopyBlock label="Citation" text={publication.citation} />}
        <CopyBlock label="BibTeX" text={bibtex(publication)} />
      </section>
    </article>
  )
}
