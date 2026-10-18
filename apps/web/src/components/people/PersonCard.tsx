import { ArrowRight } from 'lucide-react'
import type { Person } from '@/lib/people'
import SocialLinks from './SocialLinks'

/**
 * Every current member below the director uses this one card, so the page doesn't rank people by photo
 * size: the section says what someone's role is. Opens the full biography when there is one.
 */
export default function PersonCard({ person, onOpen }: { person: Person; onOpen?: () => void }) {
  const badges = [
    person.degree && (person.startYear ? `${person.degree} · since ${person.startYear}` : person.degree),
    person.founding && 'Founding',
  ].filter(Boolean)

  const photo = person.imageUrl ? (
    <img src={person.imageUrl} alt="" className="aspect-square w-full rounded-2xl object-cover object-top" />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface-dim font-sans text-3xl font-black text-on-background/40" aria-hidden>
      {initials(person.name)}
    </div>
  )

  return (
    <li className="flex flex-col rounded-3xl border border-outline-variant bg-background p-4 transition-colors hover:border-on-background">
      <div className="relative">
        {onOpen ? (
          <button type="button" onClick={onOpen} className="block w-full" aria-label={`${person.name}: read biography`}>
            {photo}
          </button>
        ) : (
          photo
        )}
        {badges.length > 0 && (
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            {badges.map((badge) => (
              <span key={String(badge)} className="rounded-full bg-background px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-on-background">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <h3 className="mt-4 font-sans text-base font-black tracking-tight text-on-background">
        {onOpen ? (
          <button type="button" onClick={onOpen} className="group inline-flex items-center gap-2 text-left hover:text-primary">
            {person.name}
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
          </button>
        ) : (
          person.name
        )}
      </h3>
      <p className="mt-1 text-sm text-on-background/60">{person.role}</p>
      {(person.expertise || person.topic) && (
        <p className="mt-3 text-sm leading-relaxed text-on-background/80">{person.expertise ?? person.topic}</p>
      )}
      {person.supervisor && <p className="mt-2 text-sm text-on-background/60">Supervised by {person.supervisor}</p>}
      <div className="mt-auto">
        <SocialLinks person={person} />
      </div>
    </li>
  )
}

/** "Nimendra Gunawardana" → "NG", ignoring titles such as Dr. or Ms. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => !/^(dr|prof|mr|ms|mrs|eng)\.?$/i.test(word))
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}
