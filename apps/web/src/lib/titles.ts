import { PUBLICATIONS } from '@/data'
import { getAllArticles } from './news'
import { getAllProjects } from './projects'
import { currentReleaseFiles } from './release'

/** Titles of pages named after their content, looked up before the page renders (for the browser tab). */

export async function newsTitle(slug: string): Promise<string | undefined> {
  const files = await currentReleaseFiles()
  const items = files ? files.news.items : getAllArticles()
  return items.find((a) => a.slug === slug)?.title
}

export async function publicationTitle(id: string): Promise<string | undefined> {
  const files = await currentReleaseFiles()
  const items = files ? files.publications.items : PUBLICATIONS
  return items.find((p) => p.id === id)?.title
}

export function projectTitle(slug: string): string | undefined {
  return getAllProjects().find((p) => p.slug === slug)?.title
}
