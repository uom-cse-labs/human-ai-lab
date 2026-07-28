import index from '@/content/news-index.gen.json'

export interface NewsIndexItem {
  slug: string
  date: string
  title: string
  content: string
  imageUrl: string
  share?: {
    twitter?: string
    linkedin?: string
  }
}

const articles = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?---\n*/, '')
}

export function getAllArticles(): NewsIndexItem[] {
  return index as NewsIndexItem[]
}

export function getArticleBody(slug: string): string | null {
  const path = `../content/news/${slug}.md`
  const raw = articles[path]
  if (!raw) return null
  return stripFrontmatter(raw)
}
