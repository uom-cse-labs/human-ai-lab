/**
 * hai-site: the public website.
 *
 *   /content/*, /media/* → published releases and photos straight from R2
 *   POST /api/contact    → rate-limited, then the dashboard Worker's contact form
 *   everything else      → the website's static files (assets, handled before this code runs)
 */
import { problemResponse } from './api/errors.ts'
import type { SiteEnv } from './env.ts'
import { currentRelease, serveFromR2 } from './r2.ts'

/** When the first import couldn't publish (someone else's drafts exist), don't ask again for a while. */
const NO_RELEASE_RETRY_MS = 10 * 60_000
let noReleaseUntil = 0

async function ensureContent(env: SiteEnv): Promise<boolean> {
  if (Date.now() < noReleaseUntil) {
    return false
  }
  const exists = await env.ADMIN.ensureContent()
  if (!exists) {
    noReleaseUntil = Date.now() + NO_RELEASE_RETRY_MS
  }
  return exists
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/content/current.json') {
      return currentRelease(request, env.CONTENT, () => ensureContent(env))
    }
    if (pathname.startsWith('/content/') || pathname.startsWith('/media/')) {
      return serveFromR2(env.CONTENT, request)
    }
    if (pathname === '/api/contact' && request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
      const { success } = (await env.CONTACT_LIMITER?.limit({ key: ip })) ?? { success: true }
      if (!success) {
        return problemResponse(429, 'RATE_LIMITED', 'Please wait a minute before sending another message.')
      }
      return env.ADMIN.contact(await request.text())
    }
    if (pathname.startsWith('/api/')) {
      return problemResponse(404, 'NOT_FOUND', 'The dashboard API is not available on the public site.')
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<SiteEnv>
