/** Photos in the media library are served from /media/{id}/…; this finds the ids a content item uses. */
const MEDIA_PATH = /\/media\/(m_[A-Za-z0-9_-]+)\//g

export function mediaIdsIn(...texts: (string | undefined)[]): string[] {
  const ids = new Set<string>()
  for (const text of texts) {
    for (const match of (text ?? '').matchAll(MEDIA_PATH)) ids.add(match[1])
  }
  return [...ids]
}

export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp'
