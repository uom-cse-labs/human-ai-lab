import { GraduationCap, Linkedin, Mail } from 'lucide-react'
import type { Person } from '@/lib/people'

/** Email, LinkedIn and Google Scholar links in round 44 px buttons (DESIGN.md §5, §7). */
export default function SocialLinks({ person }: { person: Person }) {
  const { email, linkedin, scholar } = person.socials ?? {}
  if (!email && !linkedin && !scholar) {
    return null
  }
  const link = 'flex size-11 items-center justify-center rounded-full border border-outline-variant text-on-background/60 transition-colors hover:border-primary hover:text-primary'
  return (
    <div className="mt-4 flex gap-2">
      {email && (
        <a href={email} className={link} aria-label={`Email ${person.name}`}>
          <Mail className="size-4" aria-hidden />
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer" className={link} aria-label={`${person.name} on LinkedIn`}>
          <Linkedin className="size-4" aria-hidden />
        </a>
      )}
      {scholar && (
        <a href={scholar} target="_blank" rel="noopener noreferrer" className={link} aria-label={`${person.name} on Google Scholar`}>
          <GraduationCap className="size-4" aria-hidden />
        </a>
      )}
    </div>
  )
}
