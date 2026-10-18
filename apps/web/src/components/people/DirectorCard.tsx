import type { Person } from '@/lib/people'
import SocialLinks from './SocialLinks'

/** The lab director: photo, position, full biography and links. */
export default function DirectorCard({ person }: { person: Person }) {
  return (
    <article className="grid grid-cols-1 gap-8 rounded-3xl border border-outline-variant bg-surface p-6 sm:p-8 md:grid-cols-12">
      {person.imageUrl && (
        <img src={person.imageUrl} alt={person.name} className="aspect-square w-40 rounded-2xl object-cover object-top md:col-span-3 md:w-full" />
      )}
      <div className="md:col-span-9">
        <span className="inline-block rounded-full bg-primary-light px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
          {person.role}
        </span>
        <h3 className="mt-4 font-sans text-2xl font-black tracking-tight text-on-background md:text-3xl">{person.name}</h3>
        {person.expertise && <p className="mt-2 text-base text-on-background/60">{person.expertise}</p>}
        {person.bio && <p className="mt-4 max-w-3xl text-base leading-relaxed text-on-background/80">{person.bio}</p>}
        <SocialLinks person={person} />
      </div>
    </article>
  )
}
