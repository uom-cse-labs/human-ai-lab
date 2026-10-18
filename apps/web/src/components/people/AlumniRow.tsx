import type { Person } from '@/lib/people'

/** A former member: their role in the lab and years, and where they are now. */
export default function AlumniRow({ person }: { person: Person }) {
  return (
    <li className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-12 sm:gap-6">
      <h3 className="font-sans text-base font-black tracking-tight text-on-background sm:col-span-4">{person.name}</h3>
      <p className="text-sm text-on-background/70 sm:col-span-4">
        {person.role}
        {person.period && !person.role.includes(person.period) ? ` (${person.period})` : ''}
      </p>
      <p className="text-sm text-on-background/70 sm:col-span-4">
        {person.currentPosition ? <>Now: {person.currentPosition}</> : null}
      </p>
    </li>
  )
}
