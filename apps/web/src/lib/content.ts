import { useMemo } from 'react'
import {
  ALUMNI,
  FOCUS_AREAS,
  FOUNDING_RAS,
  PUBLICATIONS,
  RESEARCH_ASSISTANTS,
  STUDENT_RESEARCHERS,
  TEAM_MEMBERS,
} from '@/data'
import type { Alumni, FocusArea, Publication, StudentResearcher, TeamMember } from '@/types'
import { type PeopleDirectory, peopleDirectory } from './people'
import { CONTENT_SOURCE, useRelease } from './release'

type Status = 'loading' | 'ready' | 'error'

// The published files use exactly the website's types (see contracts/openapi.yaml), so no mapping is needed.

export function usePublications(): { status: Status; publications: Publication[] } {
  const release = useRelease()
  return useMemo(() => {
    if (CONTENT_SOURCE === 'bundled') return { status: 'ready', publications: PUBLICATIONS }
    return { status: release.status, publications: (release.files?.publications.items ?? []) as Publication[] }
  }, [release])
}

export function useResearchThemes(): { status: Status; themes: FocusArea[] } {
  const release = useRelease()
  return useMemo(() => {
    if (CONTENT_SOURCE === 'bundled') return { status: 'ready', themes: FOCUS_AREAS }
    return { status: release.status, themes: (release.files?.themes.items ?? []) as FocusArea[] }
  }, [release])
}

export interface People {
  status: Status
  /** Director first, then faculty. */
  teamMembers: TeamMember[]
  foundingRAs: TeamMember[]
  researchAssistants: TeamMember[]
  studentResearchers: StudentResearcher[]
  alumni: Alumni[]
}

export function usePeople(): People {
  const release = useRelease()
  return useMemo(() => {
    if (CONTENT_SOURCE === 'bundled') {
      return {
        status: 'ready',
        teamMembers: TEAM_MEMBERS,
        foundingRAs: FOUNDING_RAS,
        researchAssistants: RESEARCH_ASSISTANTS,
        studentResearchers: STUDENT_RESEARCHERS,
        alumni: ALUMNI,
      }
    }
    const members = release.files?.members
    return {
      status: release.status,
      teamMembers: (members?.teamMembers ?? []) as TeamMember[],
      foundingRAs: (members?.foundingRAs ?? []) as TeamMember[],
      researchAssistants: (members?.researchAssistants ?? []) as TeamMember[],
      studentResearchers: (members?.studentResearchers ?? []) as StudentResearcher[],
      alumni: (members?.alumni ?? []) as Alumni[],
    }
  }, [release])
}

/** Everyone, grouped for the People page (see lib/people.ts). */
export function usePeopleDirectory(): { status: Status; directory: PeopleDirectory } {
  const release = useRelease()
  return useMemo(() => {
    if (CONTENT_SOURCE === 'bundled') {
      return {
        status: 'ready',
        directory: peopleDirectory({
          teamMembers: TEAM_MEMBERS,
          foundingRAs: FOUNDING_RAS,
          researchAssistants: RESEARCH_ASSISTANTS,
          studentResearchers: STUDENT_RESEARCHERS,
          alumni: ALUMNI,
        }),
      }
    }
    return { status: release.status, directory: peopleDirectory(release.files?.members) }
  }, [release])
}
