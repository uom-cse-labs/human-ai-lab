import { describe, expect, it } from 'vitest'
import { ContentService } from '../../src/api/content.ts'
import type { ContentItem } from '../../src/api/model.ts'
import { migrateLegacyGroups } from '../../src/api/people.ts'
import { checkPublishRules } from '../../src/api/publish-rules.ts'
import { PublishService } from '../../src/api/publishing.ts'
import { releaseFiles } from '../../src/api/release-files.ts'
import { importSiteContent, type SeedBundle } from '../../src/api/seed.ts'
import { MemoryFiles, MemoryStore } from '../../src/api/store.ts'
import seed from '../../src/seed.gen.json'

let n = 0
function member(title: string, fields: Record<string, unknown>): ContentItem {
  n++
  return {
    id: `m_${n}`, type: 'member', slug: `person-${n}`, title, fields: { role: 'Role', ...fields }, mediaRefs: [],
    status: 'published', version: 3, publishedVersion: 3, updatedBy: 'a', updatedAt: '2026-10-01T00:00:00Z',
  }
}

describe('moving people from the older groups', () => {
  it('splits "team" into director, research fellows and faculty, and keeps everything else', () => {
    const people = [
      member('Faculty B', { group: 'team', order: 2, role: 'PRINCIPAL INVESTIGATOR' }),
      member('Director', { group: 'team', order: 1, role: 'DIRECTOR, HUMAN AI LAB' }),
      member('Fellow', { group: 'team', order: 3, role: 'RESEARCH FELLOW' }),
      member('Founder', { group: 'founding-ra', order: 1 }),
      member('Undergrad', { group: 'student', role: 'Undergraduate Researcher, CSE' }),
      member('Doctoral', { group: 'student', role: 'PhD Student, CSE' }),
      member('Already new', { group: 'faculty' }),
    ]
    const migrated = Object.fromEntries(migrateLegacyGroups(people).map((m) => [m.title, m]))
    expect(migrated.Director.fields.group).toBe('director')
    expect(migrated['Faculty B'].fields.group).toBe('faculty')
    expect(migrated.Fellow.fields.group).toBe('research-fellow')
    expect(migrated.Founder.fields).toMatchObject({ group: 'research-assistant', founding: 'yes' })
    expect(migrated.Undergrad.fields.group).toBe('undergraduate')
    expect(migrated.Doctoral.fields).toMatchObject({ group: 'postgraduate', degree: 'PhD' })
    expect(migrated).not.toHaveProperty('Already new')
    // A content change, not an edit: the version and published state stay as they were.
    expect(migrated.Director).toMatchObject({ version: 3, publishedVersion: 3, status: 'published' })
  })

  it('never makes a second director', () => {
    const people = [member('Director', { group: 'director' }), member('Old team', { group: 'team', order: 1 })]
    expect(migrateLegacyGroups(people)[0].fields.group).toBe('faculty')
  })

  it('does nothing when everyone is on the academic groups', () => {
    expect(migrateLegacyGroups([member('A', { group: 'faculty' })])).toEqual([])
  })
})

describe('the published people list', () => {
  const file = (people: ContentItem[]) => releaseFiles(new Map([['member', people]]))['members.json'] as Record<string, any>

  it('lists everyone in academic order, with postgraduate details', () => {
    const published = file([
      member('Alumna', { group: 'alumni', period: '2022 – 2024', currentPosition: 'Google' }),
      member('Doctoral', { group: 'postgraduate', degree: 'PhD', startYear: 2025, supervisor: 'Prof. A' }),
      member('Faculty', { group: 'faculty' }),
      member('Founder', { group: 'research-assistant', founding: 'yes' }),
      member('Director', { group: 'director' }),
    ])
    expect(published.people.map((p: { name: string }) => p.name)).toEqual(['Director', 'Faculty', 'Doctoral', 'Founder', 'Alumna'])
    expect(published.people[2]).toMatchObject({ group: 'postgraduate', degree: 'PhD', startYear: 2025, supervisor: 'Prof. A' })
    expect(published.people[3]).toMatchObject({ group: 'research-assistant', founding: true })
    expect(published.people[1]).not.toHaveProperty('founding')
  })

  it('keeps the older lists for earlier website versions, without the new fields', () => {
    const published = file([
      member('Director', { group: 'director', order: 1 }),
      member('Fellow', { group: 'research-fellow', order: 3 }),
      member('Faculty', { group: 'faculty', order: 2 }),
      member('Founder', { group: 'research-assistant', founding: 'yes' }),
      member('Assistant', { group: 'research-assistant' }),
      member('Doctoral', { group: 'postgraduate', degree: 'PhD', order: 1 }),
      member('Undergrad', { group: 'undergraduate', order: 2 }),
    ])
    const names = (list: { name: string }[]) => list.map((p) => p.name)
    expect(names(published.teamMembers)).toEqual(['Director', 'Faculty', 'Fellow'])
    expect(names(published.foundingRAs)).toEqual(['Founder'])
    expect(names(published.researchAssistants)).toEqual(['Assistant'])
    expect(names(published.studentResearchers)).toEqual(['Doctoral', 'Undergrad'])
    expect(published.foundingRAs[0]).not.toHaveProperty('founding')
    expect(published.studentResearchers[0]).not.toHaveProperty('degree')
  })

  it('publishes people still on the older groups as their academic group', () => {
    const published = file([member('Director', { group: 'team', order: 1 }), member('Founder', { group: 'founding-ra' })])
    expect(published.people.map((p: { group: string }) => p.group)).toEqual(['director', 'research-assistant'])
  })
})

describe('publish rules for people', () => {
  const problems = (...people: ContentItem[]) => checkPublishRules(new Map([['member', people]])).map((p) => p.message)

  it('needs a known group, a role, and a degree for postgraduate researchers', () => {
    expect(problems(member('Ok', { group: 'faculty' }))).toEqual([])
    expect(problems(member('Visitor', { group: 'visitor' }))).toEqual(['"Visitor" needs a valid group.'])
    expect(problems(member('No degree', { group: 'postgraduate' }))).toEqual(['"No degree" needs a valid degree.'])
    expect(problems(member('Doctoral', { group: 'postgraduate', degree: 'PhD' }))).toEqual([])
  })

  it('allows only one director', () => {
    expect(problems(member('First', { group: 'director' }), member('Second', { group: 'director' })))
      .toEqual(['"Second" is also set as director. Only one person can be the director.'])
  })
})

describe('importing the website people', () => {
  it('puts everyone in the right academic group', async () => {
    const store = new MemoryStore()
    const files = new MemoryFiles()
    importSiteContent(seed as SeedBundle, new ContentService(store))
    const release = await new PublishService(store, files).publish(undefined, 'website import')
    const people = (files.json(`content/releases/${release.id}/members.json`) as { people: { group: string; founding?: boolean }[] }).people
    const count = (group: string) => people.filter((p) => p.group === group).length
    expect([count('director'), count('faculty'), count('research-fellow'), count('research-assistant'), count('undergraduate'), count('alumni')])
      .toEqual([1, 4, 2, 5, 4, 4])
    expect(people.filter((p) => p.founding)).toHaveLength(4)
  })
})
