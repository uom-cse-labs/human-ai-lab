import type { Publication, FocusArea, TeamMember, StudentResearcher, Alumni } from './types';
import teamData from './data.json';
import publications from './content/publications.json';
import themes from './content/themes.json';

// Bundled content, used when the site isn't reading published releases (VITE_CONTENT_SOURCE unset).
// The Content API imports these files into the dashboard on first start.

export const PUBLICATIONS = publications as Publication[];

export const FOCUS_AREAS = themes as FocusArea[];

export const TEAM_MEMBERS: TeamMember[] = teamData.teamMembers;

export const FOUNDING_RAS: TeamMember[] = teamData.foundingRAs;

export const RESEARCH_ASSISTANTS: TeamMember[] = (teamData as any).researchAssistants || [];

export const STUDENT_RESEARCHERS: StudentResearcher[] = teamData.studentResearchers;

export const ALUMNI: Alumni[] = teamData.alumni;
