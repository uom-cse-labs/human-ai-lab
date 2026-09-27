import type { AccessSettings } from './api/access.ts'
import type { AdminEnv } from './env.ts'

/**
 * Accepts the Access team name in any form people copy it: "hai-lab", "hai-lab.cloudflareaccess.com" or
 * "https://hai-lab.cloudflareaccess.com/". Returns the issuer URL, or undefined when not set.
 */
export function accessIssuer(teamDomain: string | undefined): string | undefined {
  const team = (teamDomain ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
  if (!team) {
    return undefined
  }
  return `https://${team.includes('.') ? team : `${team}.cloudflareaccess.com`}`
}

/** The Access settings, or undefined until both the team and the AUD tag are set. */
export function accessSettings(env: AdminEnv): AccessSettings | undefined {
  const issuer = accessIssuer(env.ACCESS_TEAM_DOMAIN)
  const audience = env.ACCESS_AUD?.trim()
  if (!issuer || !audience) {
    return undefined
  }
  return { issuer, audience, adminEmails: (env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim()).filter(Boolean) }
}
