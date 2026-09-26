import { useMemo } from 'react'
import index from '@/content/news-index.gen.json'
import { CONTENT_SOURCE, useRelease } from './release'

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

export interface NewsState {
  status: 'loading' | 'ready' | 'error'
  articles: NewsIndexItem[]
  getBody: (slug: string) => string | null
}

// ---------------------------------------------------------------- bundled

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
  const raw = articles[`../content/news/${slug}.md`]
  return raw ? stripFrontmatter(raw) : null
}

const bundled: NewsState = { status: 'ready', articles: getAllArticles(), getBody: getArticleBody }

// ---------------------------------------------------------------- releases

/** 2026-08-18 → "AUGUST 18, 2026", the format the site already displays. */
function displayDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

/** News for the current page, from the configured content source. */
export function useNews(): NewsState {
  const release = useRelease()
  return useMemo(() => {
    if (CONTENT_SOURCE === 'bundled') return bundled
    const news = release.files?.news
    if (!news) return { status: release.status, articles: [], getBody: () => null }
    const bodies = new Map(news.items.map((item) => [item.slug, item.body ?? '']))
    return {
      status: 'ready',
      articles: news.items.map((item) => ({
        slug: item.slug,
        title: item.title,
        date: displayDate(item.date),
        content: item.summary ?? '',
        imageUrl: item.cover?.src ?? '',
      })),
      getBody: (slug: string) => bodies.get(slug) ?? null,
    }
  }, [release])
}
