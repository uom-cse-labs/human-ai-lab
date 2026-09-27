import { describe, expect, it } from 'vitest'
import { accessIssuer, accessSettings } from '../src/config.ts'
import type { AdminEnv } from '../src/env.ts'

const env = { ACCESS_TEAM_DOMAIN: '', ACCESS_AUD: '', ADMIN_EMAILS: ' a@example.org, B@example.org ,', MAIL_TO_ADDRESS: 'lab@example.org' } as AdminEnv

describe('accessIssuer', () => {
  it('accepts the team name however it was copied', () => {
    for (const input of ['hai-lab', 'hai-lab.cloudflareaccess.com', 'https://hai-lab.cloudflareaccess.com/', ' hai-lab ']) {
      expect(accessIssuer(input)).toBe('https://hai-lab.cloudflareaccess.com')
    }
  })

  it('is undefined until set', () => {
    expect(accessIssuer('')).toBeUndefined()
    expect(accessIssuer(undefined)).toBeUndefined()
  })
})

describe('accessSettings', () => {
  it('stays unset until both the team and the AUD tag are given', () => {
    expect(accessSettings({ ...env, ACCESS_TEAM_DOMAIN: 'hai-lab' })).toBeUndefined()
    expect(accessSettings({ ...env, ACCESS_TEAM_DOMAIN: 'hai-lab', ACCESS_AUD: ' aud123 ' })).toEqual({
      issuer: 'https://hai-lab.cloudflareaccess.com',
      audience: 'aud123',
      adminEmails: ['a@example.org', 'B@example.org'],
    })
  })
})
