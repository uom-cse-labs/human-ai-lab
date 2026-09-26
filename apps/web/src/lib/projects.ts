import index from '@/content/projects-index.gen.json'

export interface ProjectIndexItem {
  slug: string
  date: string
  title: string
  content: string
  imageUrl: string
  order?: number
  share?: {
    twitter?: string
    linkedin?: string
  }
}

const articles = import.meta.glob('../content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?---\n*/, '')
}

export function getAllProjects(): ProjectIndexItem[] {
  return index as ProjectIndexItem[]
}

export function getProjectBody(slug: string): string | null {
  const path = `../content/projects/${slug}.md`
  const raw = articles[path]
  if (!raw) return null
  return stripFrontmatter(raw)
}
