import { createFileRoute } from '@tanstack/react-router'
import { titled } from '@/lib/title'
import { useLab } from '@/lab-context'
import { usePeopleDirectory } from '@/lib/content'
import { asTeamMember } from '@/lib/people'
import AlumniRow from '@/components/people/AlumniRow'
import DirectorCard from '@/components/people/DirectorCard'
import JumpLink from '@/components/people/JumpLink'
import PeopleSection from '@/components/people/PeopleSection'
import PersonCard from '@/components/people/PersonCard'
import type { Person } from '@/lib/people'

export const Route = createFileRoute('/people')({
  head: titled('People'),
  component: PeoplePage,
})

/**
 * Everyone in the lab, grouped as academic labs do: director, faculty, research fellows, postgraduate
 * researchers, research assistants, undergraduate researchers, then alumni. Empty groups are left out.
 */
function PeoplePage() {
  const { directory } = usePeopleDirectory()
  const { setSelectedMember } = useLab()
  const { director, faculty, fellows, postgraduates, assistants, undergraduates, alumni } = directory

  const sections = [
    { id: 'director', label: 'Director', count: director ? 1 : 0 },
    { id: 'faculty', label: 'Faculty', count: faculty.length },
    { id: 'research-fellows', label: 'Research fellows', count: fellows.length },
    { id: 'postgraduate-researchers', label: 'Postgraduate researchers', count: postgraduates.length },
    { id: 'research-assistants', label: 'Research assistants', count: assistants.length },
    { id: 'undergraduate-researchers', label: 'Undergraduate researchers', count: undergraduates.length },
    { id: 'alumni', label: 'Alumni', count: alumni.length },
  ].filter((s) => s.count > 0)

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24">
      <header className="pb-10 pt-16 md:pt-24">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">People</span>
        <h1 className="mt-3 max-w-4xl font-sans text-4xl font-black tracking-tight text-on-background md:text-6xl">
          The people of the Human-AI Lab
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-background/70">
          Faculty, researchers and students from the Department of Computer Science &amp; Engineering, University of
          Moratuwa, working together on human-centered artificial intelligence.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Jump to a group">
          {sections.map((s) => (
            <JumpLink key={s.id} id={s.id} label={s.label} count={s.count} />
          ))}
        </ul>
      </header>

      {director && (
        <PeopleSection id="director" title="Director" count={1}>
          <DirectorCard person={director} />
        </PeopleSection>
      )}

      {[
        { id: 'faculty', title: 'Faculty', people: faculty },
        { id: 'research-fellows', title: 'Research fellows', people: fellows },
        {
          id: 'postgraduate-researchers',
          title: 'Postgraduate researchers',
          people: postgraduates,
          description: 'PhD, MPhil and MSc (research) students supervised in the lab.',
        },
        { id: 'research-assistants', title: 'Research assistants', people: assistants },
        { id: 'undergraduate-researchers', title: 'Undergraduate researchers', people: undergraduates },
      ]
        .filter((group) => group.people.length > 0)
        .map((group) => (
          <PeopleSection key={group.id} id={group.id} title={group.title} count={group.people.length} description={group.description}>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {group.people.map((p: Person) => (
                <PersonCard key={p.id} person={p} onOpen={p.bio ? () => setSelectedMember(asTeamMember(p)) : undefined} />
              ))}
            </ul>
          </PeopleSection>
        ))}

      {alumni.length > 0 && (
        <PeopleSection id="alumni" title="Alumni" count={alumni.length}>
          <ul className="divide-y divide-outline-variant border-y border-outline-variant">
            {alumni.map((p) => (
              <AlumniRow key={p.id} person={p} />
            ))}
          </ul>
        </PeopleSection>
      )}
    </div>
  )
}
