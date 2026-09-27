import type { AdminService } from './admin.ts'
import type { ContentStore } from './content-store.ts'

/** Bindings and settings of the dashboard Worker (admin/wrangler.jsonc). */
export interface AdminEnv {
  ASSETS: Fetcher
  CONTENT: R2Bucket
  CONTENT_STORE: DurableObjectNamespace<ContentStore>
  /** Cloudflare Images, for photo sizes. Absent in some local setups: photos then keep their original size. */
  IMAGES?: ImagesBinding
  // Settings (vars in admin/wrangler.jsonc)
  ACCESS_TEAM_DOMAIN: string
  ACCESS_AUD: string
  MAIL_TO_ADDRESS: string
  MAIL_FROM_ADDRESS: string
  /** "true" only for `npm run dev:local`: sign-in is simulated, and only on localhost. */
  SIMULATED_SIGN_IN?: string
  // Secrets (set by scripts/deploy.mjs), kept out of the public repository
  /** Who can publish and roll back, comma-separated emails. */
  ADMIN_EMAILS?: string
  BREVO_API_KEY?: string
}

/** Bindings of the public site Worker (site/wrangler.jsonc). */
export interface SiteEnv {
  ASSETS: Fetcher
  CONTENT: R2Bucket
  ADMIN: Service<AdminService>
  /** Optional: if the account's plan refuses the binding, remove it from site/wrangler.jsonc. */
  CONTACT_LIMITER?: RateLimit
}
