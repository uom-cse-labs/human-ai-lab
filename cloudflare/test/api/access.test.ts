import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { authenticate, clearKeyCache } from '../../src/api/access.ts'

const settings = { issuer: 'https://hai-lab.cloudflareaccess.com', audience: 'aud-123', adminEmails: ['Director@Example.org'] }
let privateKey: CryptoKey
let otherKey: CryptoKey
let jwks: { keys: JsonWebKey[] }

const b64 = (data: string | Uint8Array) => Buffer.from(data).toString('base64url')

async function token(claims: Record<string, unknown>, { key = privateKey, kid = 'k1', alg = 'RS256' } = {}) {
  const now = Math.floor(Date.now() / 1000)
  const body = `${b64(JSON.stringify({ alg, kid }))}.${b64(JSON.stringify({ iss: settings.issuer, aud: [settings.audience], iat: now, exp: now + 3600, ...claims }))}`
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(body))
  return `${body}.${b64(new Uint8Array(signature))}`
}

const fetchKeys = async () => jwks as never

beforeAll(async () => {
  const params = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
  const pair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair
  privateKey = pair.privateKey
  otherKey = ((await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair).privateKey
  jwks = { keys: [{ ...((await crypto.subtle.exportKey('jwk', pair.publicKey)) as JsonWebKey), kid: 'k1' } as JsonWebKey] }
})

beforeEach(() => clearKeyCache())

describe('Cloudflare Access sign-in', () => {
  it('anyone Access lets in is an editor; ADMIN_EMAILS are admins, ignoring case', async () => {
    expect(await authenticate(await token({ email: 'asha@example.org' }), settings, fetchKeys)).toEqual({ name: 'asha@example.org', role: 'editor' })
    expect(await authenticate(await token({ email: 'director@example.org' }), settings, fetchKeys)).toEqual({ name: 'director@example.org', role: 'admin' })
  })

  it('needs a token', async () => {
    await expect(authenticate(null, settings, fetchKeys)).rejects.toMatchObject({ status: 401, code: 'SIGN_IN_REQUIRED' })
  })

  it('rejects forged, foreign and expired tokens', async () => {
    const reject = async (t: string, why: string) =>
      expect(authenticate(t, settings, fetchKeys)).rejects.toMatchObject({ status: 401, message: expect.stringContaining(why) })
    await reject('not-a-jwt', 'malformed')
    await reject(await token({ email: 'a@example.org' }, { key: otherKey }), 'bad signature')
    await reject(await token({ email: 'a@example.org' }, { kid: 'k-unknown' }), 'unknown signing key')
    await reject(await token({ email: 'a@example.org' }, { alg: 'none' }), 'unsupported signature')
    await reject(await token({ email: 'a@example.org', iss: 'https://evil.cloudflareaccess.com' }), 'wrong issuer')
    await reject(await token({ email: 'a@example.org', aud: ['another-app'] }), 'wrong audience')
    await reject(await token({ email: 'a@example.org', exp: Math.floor(Date.now() / 1000) - 3600 }), 'expired')
  })

  it('service tokens without an email get no role', async () => {
    await expect(authenticate(await token({ common_name: 'ci' }), settings, fetchKeys)).rejects.toMatchObject({ status: 403 })
  })
})
