import type { components } from '@hai/content-schema'
import type { TeamMember } from '@/types'

type PublishedPerson = components['schemas']['PublishedPerson']
type PublishedMembersFile = components['schemas']['PublishedMembersFile']
export type PeopleGroup = components['schemas']['PeopleGroup']

/** Someone on the People page. */
export interface Person {
  id: string
  name: string
  /** Position, e.g. "Senior Lecturer" or "PhD Student, CSE" */
  role: string
  title?: string
  bio?: string
  /** Research interests */
  expertise?: string
  imageUrl?: string
  topic?: string
  period?: string
  currentPosition?: string
  socials?: { email?: string; linkedin?: string; scholar?: string }
  group: PeopleGroup
  degree?: 'PhD' | 'MPhil' | 'MSc'
  startYear?: number
  supervisor?: string
  founding?: boolean
}

/** Everyone, in the sections of the People page: most senior first, alumni last. */
export interface PeopleDirectory {
  director?: Person
  faculty: Person[]
  fellows: Person[]
  postgraduates: Person[]
  assistants: Person[]
  undergraduates: Person[]
  alumni: Person[]
  /** People currently in the lab (everyone but alumni). */
  currentCount: number
}

const DEGREES = ['PhD', 'MPhil', 'MSc'] as const

/**
 * Builds the directory from a members file. New releases list everyone with their group (`people`);
 * older releases and the site's built-in data.json only have the older lists, which are mapped the same
 * way the Content API maps them: the first of teamMembers is the director, research fellows and faculty
 * by their role, founding research assistants flagged.
 */
export function peopleDirectory(members: Partial<PublishedMembersFile> | undefined): PeopleDirectory {
  const people = members?.people?.length ? members.people.map(fromPublished) : fromOlderLists(members)
  const inGroup = (group: PeopleGroup) => people.filter((p) => p.group === group)
  const alumni = inGroup('alumni')
  return {
    director: inGroup('director')[0],
    faculty: inGroup('faculty'),
    fellows: inGroup('research-fellow'),
    postgraduates: inGroup('postgraduate'),
    assistants: inGroup('research-assistant'),
    undergraduates: inGroup('undergraduate'),
    alumni,
    currentCount: people.length - alumni.length,
  }
}

/** The bio pop-up's shape. */
export function asTeamMember(person: Person): TeamMember {
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    title: person.title ?? person.role,
    bio: person.bio,
    expertise: person.expertise,
    imageUrl: person.imageUrl ?? '',
    socials: person.socials,
  }
}

function fromPublished(p: PublishedPerson): Person {
  return { ...p, id: p.id ?? slug(p.name), group: p.group ?? 'faculty' }
}

function fromOlderLists(members: Partial<PublishedMembersFile> | undefined): Person[] {
  const list = (people: PublishedPerson[] | undefined, group: (p: PublishedPerson, index: number) => Partial<Person>) =>
    (people ?? []).map((p, index): Person => ({ ...p, id: p.id ?? slug(p.name), group: 'faculty', ...group(p, index) }))
  return [
    ...list(members?.teamMembers, (p, index) => ({
      group: index === 0 ? 'director' : `${p.role} ${p.title ?? ''}`.toLowerCase().includes('fellow') ? 'research-fellow' : 'faculty',
    })),
    ...list(members?.foundingRAs, () => ({ group: 'research-assistant', founding: true })),
    ...list(members?.researchAssistants, () => ({ group: 'research-assistant' })),
    ...list(members?.studentResearchers, (p) => {
      const degree = DEGREES.find((d) => p.role.toLowerCase().includes(d.toLowerCase()))
      return degree ? { group: 'postgraduate', degree } : { group: 'undergraduate' }
    }),
    ...list(members?.alumni, () => ({ group: 'alumni' })),
  ]
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
