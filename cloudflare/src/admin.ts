/**
 * hai-admin: the content dashboard and the Content API, behind Cloudflare Access.
 *
 *   /api/contact         → the public contact form (the site Worker also calls it through AdminService)
 *   /api/*               → the Content API, for signed-in editors and admins (ContentStore)
 *   /content/*, /media/* → published files straight from R2, for previews
 *   everything else      → the dashboard's static files (assets, handled before this code runs)
 */
import { WorkerEntrypoint } from 'cloudflare:workers'
import { authenticate, type User } from './api/access.ts'
import { brevoSender, logSender, submitContact } from './api/contact.ts'
import { ApiError, problemResponse } from './api/errors.ts'
import { contactMessage, readJson } from './api/validation.ts'
import { accessSettings } from './config.ts'
import type { AdminEnv } from './env.ts'
import { currentRelease, serveFromR2 } from './r2.ts'

export { ContentStore } from './content-store.ts'

/** One store for the whole site: every request goes to the same Durable Object. */
function contentStore(env: AdminEnv) {
  return env.CONTENT_STORE.getByName('content')
}

/** The public contact form. */
async function contact(body: string, env: AdminEnv): Promise<Response> {
  try {
    const message = contactMessage(await readJson(new Request('http://contact', { method: 'POST', body })))
    const send = env.BREVO_API_KEY?.trim()
      ? brevoSender(env.BREVO_API_KEY.trim(), env.MAIL_FROM_ADDRESS?.trim() || env.MAIL_TO_ADDRESS)
      : logSender
    await submitContact(message, send, env.MAIL_TO_ADDRESS)
    return Response.json({ success: true }, { status: 202 })
  } catch (e) {
    if (e instanceof ApiError) {
      return e.toResponse()
    }
    throw e
  }
}

/** Who is signing in: Cloudflare Access, or the simulated sign-in of `npm run dev:local` (localhost only). */
async function signedInUser(request: Request, env: AdminEnv): Promise<User> {
  const { hostname } = new URL(request.url)
  if (env.SIMULATED_SIGN_IN === 'true' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    const editor = request.headers.get('X-Local-Role')?.toLowerCase() === 'editor'
    return editor ? { name: 'local-editor', role: 'editor' } : { name: 'local-admin', role: 'admin' }
  }
  const settings = accessSettings(env)
  if (!settings) {
    throw new ApiError(401, 'SIGN_IN_REQUIRED',
      'This dashboard is not protected by Cloudflare Access yet, so nobody can sign in. See "Protect the dashboard" in cloudflare/README.md.')
  }
  return authenticate(request.headers.get('Cf-Access-Jwt-Assertion'), settings)
}

export class AdminService extends WorkerEntrypoint<AdminEnv> {
  /** The public contact form (the site Worker has already rate-limited it). */
  async contact(body: string): Promise<Response> {
    return contact(body, this.env)
  }

  /** Imports and publishes the site's content if nothing has been published yet. Returns whether a release exists. */
  async ensureContent(): Promise<boolean> {
    return contentStore(this.env).ensureContent()
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/content/current.json') {
      return currentRelease(request, env.CONTENT, () => contentStore(env).ensureContent())
    }
    if (pathname.startsWith('/content/') || pathname.startsWith('/media/')) {
      return serveFromR2(env.CONTENT, request)
    }
    if (pathname === '/api/contact' && request.method === 'POST') {
      return contact(await request.text(), env)
    }
    if (pathname.startsWith('/api/')) {
      let user: User
      try {
        user = await signedInUser(request, env)
      } catch (e) {
        if (e instanceof ApiError) {
          return e.toResponse()
        }
        console.error('Sign-in check failed', e)
        return problemResponse(503, 'SIGN_IN_UNAVAILABLE', 'Sign-in could not be checked just now. Try again in a minute.')
      }
      return contentStore(env).handle(request, user)
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<AdminEnv>
