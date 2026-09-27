/**
 * Sign-in with Cloudflare Access. Access sits in front of the dashboard and adds a signed token to every
 * request in the Cf-Access-Jwt-Assertion header; it's verified here (signature, issuer, audience, expiry),
 * so the API never relies on Access being configured correctly alone.
 */
import { ApiError } from './errors.ts'

export type Role = 'admin' | 'editor'

export interface User {
  /** Recorded as updatedBy and publishedBy: the email address. */
  name: string
  role: Role
}

export interface AccessSettings {
  /** https://<team>.cloudflareaccess.com */
  issuer: string
  /** The Access application's AUD tag */
  audience: string
  adminEmails: string[]
}

type Jwks = { keys: (JsonWebKey & { kid?: string })[] }
type KeyFetcher = (url: string) => Promise<Jwks>

const CLOCK_SKEW_SECONDS = 60
const KEY_REFRESH_MS = 60_000
const keyCache = new Map<string, { keys: Map<string, CryptoKey>; fetchedAt: number }>()

const fetchJwks: KeyFetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not fetch Access signing keys: HTTP ${response.status}`)
  }
  return response.json()
}

/** The signed-in user, or an ApiError (401 for a bad token, 403 for a token without an email). */
export async function authenticate(token: string | null, settings: AccessSettings, fetchKeys: KeyFetcher = fetchJwks,
  now: () => number = Date.now): Promise<User> {
  if (!token) {
    throw new ApiError(401, 'SIGN_IN_REQUIRED', 'Sign in through Cloudflare Access first.')
  }
  const claims = await verify(token, settings, fetchKeys, now)
  const email = typeof claims.email === 'string' ? claims.email.trim() : ''
  if (!email) {
    // Access service tokens carry no email: they may not use the dashboard.
    throw new ApiError(403, 'FORBIDDEN', 'This sign-in has no email address, so it has no dashboard role.')
  }
  const admin = settings.adminEmails.some((a) => a.trim().toLowerCase() === email.toLowerCase())
  return { name: email, role: admin ? 'admin' : 'editor' }
}

async function verify(token: string, settings: AccessSettings, fetchKeys: KeyFetcher, now: () => number): Promise<Record<string, unknown>> {
  const invalid = (why: string) => new ApiError(401, 'INVALID_TOKEN', `The sign-in token is not valid (${why}). Sign in again.`)
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw invalid('malformed')
  }
  let header: { alg?: string; kid?: string }
  let claims: Record<string, unknown>
  try {
    header = JSON.parse(base64UrlText(parts[0]))
    claims = JSON.parse(base64UrlText(parts[1]))
  } catch {
    throw invalid('malformed')
  }
  if (header.alg !== 'RS256' || !header.kid) {
    throw invalid('unsupported signature')
  }
  const key = await signingKey(settings.issuer, header.kid, fetchKeys, now)
  if (!key) {
    throw invalid('unknown signing key')
  }
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlBytes(parts[2]), signed))) {
    throw invalid('bad signature')
  }
  if (claims.iss !== settings.issuer) {
    throw invalid('wrong issuer')
  }
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!audiences.includes(settings.audience)) {
    throw invalid('wrong audience')
  }
  const seconds = now() / 1000
  if (typeof claims.exp !== 'number' || claims.exp < seconds - CLOCK_SKEW_SECONDS) {
    throw invalid('expired')
  }
  if (typeof claims.nbf === 'number' && claims.nbf > seconds + CLOCK_SKEW_SECONDS) {
    throw invalid('not yet valid')
  }
  return claims
}

/** Access publishes its current and previous keys; they're cached and re-fetched when an unknown key appears. */
async function signingKey(issuer: string, kid: string, fetchKeys: KeyFetcher, now: () => number): Promise<CryptoKey | undefined> {
  let cached = keyCache.get(issuer)
  if (!cached?.keys.has(kid) && (!cached || now() - cached.fetchedAt > KEY_REFRESH_MS || !cached.keys.size)) {
    const jwks = await fetchKeys(`${issuer}/cdn-cgi/access/certs`)
    const keys = new Map<string, CryptoKey>()
    for (const jwk of jwks.keys ?? []) {
      if (jwk.kid && jwk.kty === 'RSA') {
        keys.set(jwk.kid, await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']))
      }
    }
    cached = { keys, fetchedAt: now() }
    keyCache.set(issuer, cached)
  }
  return cached?.keys.get(kid)
}

/** Tests only: forget cached signing keys. */
export function clearKeyCache() {
  keyCache.clear()
}

function base64UrlBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

function base64UrlText(value: string): string {
  return new TextDecoder().decode(base64UrlBytes(value))
}
