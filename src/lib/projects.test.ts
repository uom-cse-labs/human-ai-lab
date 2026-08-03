import { describe, it, expect } from 'vitest'
import { getAllProjects, getProjectBody } from './projects'

describe('getAllProjects', () => {
  it('returns all projects from the generated index', () => {
    const projects = getAllProjects()
    expect(projects.length).toBe(6)
  })

  it('returns projects sorted by order first, then date descending', () => {
    const projects = getAllProjects()
    expect(projects.map((p) => p.slug)).toEqual([
      'personalized-sinhala-speech-recognition',
      'social-media-virality-modeling',
      'research-to-product-automation',
      'formally-constrained-self-evolution',
      'stresssense-smartphone-mental-health',
      'graspnet-6dof-grasp-pose-estimation',
    ])
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

  it('does not include the order field when absent', () => {
    const projects = getAllProjects()
    expect(projects[0].order).toBeUndefined()
  })

  it('does not include share links when absent from frontmatter', () => {
    const projects = getAllProjects()
    for (const project of projects) {
      expect(project.share).toBeUndefined()
    }
  })
})

describe('getProjectBody', () => {
  it('returns the markdown body for a valid slug', () => {
    const body = getProjectBody('personalized-sinhala-speech-recognition')
    expect(body).not.toBeNull()
    expect(body).toContain('## Team')
  })

  it('returns null for a non-existent slug', () => {
    const body = getProjectBody('non-existent-project')
    expect(body).toBeNull()
  })

  it('strips frontmatter from the body', () => {
    const body = getProjectBody('personalized-sinhala-speech-recognition')
    expect(body).not.toContain('---')
    expect(body).not.toContain('imageUrl:')
  })
})
