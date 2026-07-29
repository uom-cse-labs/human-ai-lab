import { describe, it, expect } from 'vitest'
import { getAllProjects, getProjectBody } from './projects'

describe('getAllProjects', () => {
  it('returns all projects from the generated index', () => {
    const projects = getAllProjects()
    expect(projects.length).toBe(3)
  })

  it('returns projects sorted by order first, then date descending', () => {
    const projects = getAllProjects()
    expect(projects[0].slug).toBe('ai-governance-framework')
    expect(projects[1].slug).toBe('healthcare-audit-protocol')
    expect(projects[2].slug).toBe('agricultural-ai-ethics')
  })

  it('returns projects with the correct shape', () => {
    const projects = getAllProjects()
    const project = projects[0]
    expect(project).toHaveProperty('slug')
    expect(project).toHaveProperty('title')
    expect(project).toHaveProperty('date')
    expect(project).toHaveProperty('content')
    expect(project).toHaveProperty('imageUrl')
  })

  it('includes the order field when present', () => {
    const projects = getAllProjects()
    expect(projects[0].order).toBe(0)
  })

  it('includes share links when present in frontmatter', () => {
    const projects = getAllProjects()
    expect(projects[0].share?.twitter).toBeDefined()
    expect(projects[0].share?.linkedin).toBeDefined()
  })

  it('does not include share links when absent from frontmatter', () => {
    const projects = getAllProjects()
    expect(projects[2].share).toBeUndefined()
  })
})

describe('getProjectBody', () => {
  it('returns the markdown body for a valid slug', () => {
    const body = getProjectBody('ai-governance-framework')
    expect(body).not.toBeNull()
    expect(body).toContain('## Overview')
  })

  it('returns null for a non-existent slug', () => {
    const body = getProjectBody('non-existent-project')
    expect(body).toBeNull()
  })

  it('strips frontmatter from the body', () => {
    const body = getProjectBody('ai-governance-framework')
    expect(body).not.toContain('---')
    expect(body).not.toContain('imageUrl:')
  })
})
