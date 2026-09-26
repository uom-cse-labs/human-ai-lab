export type EnvName = 'staging' | 'prod'

/** Per-environment settings. Everything environment-specific lives here, never in stack code. */
export interface EnvConfig {
  readonly name: EnvName
  /** AWS account of this environment (hai-staging or hai-prod in the Organization). */
  readonly account: string
  /** Workload region (technical design §7.5). CloudFront-scoped resources go to us-east-1 automatically. */
  readonly region: 'ap-south-1'
  readonly github: {
    /** owner/name of the repository allowed to deploy */
    readonly repository: string
    /** the only branch whose workflows may assume the deploy role */
    readonly branch: string
  }
  readonly api: {
    /** x86_64 until SnapStart on arm64 is confirmed in ap-south-1 (phase 2 spike) */
    readonly architecture: 'x86_64' | 'arm64'
    readonly memoryMiB: number
    readonly reservedConcurrency: number
  }
  readonly waf: {
    readonly apiRequestsPer5Min: number
    readonly contactRequestsPer5Min: number
  }
  readonly mail: {
    readonly fromAddress: string
    readonly toAddress: string
  }
  readonly auth: {
    /** OAuth callback URLs of the admin dashboard (local dev first; real hostnames added in phase 4) */
    readonly callbackUrls: string[]
    readonly logoutUrls: string[]
  }
  readonly budget: {
    readonly monthlyUsd: number
    readonly alertEmails: string[]
  }
  /** Production keeps deletion protection on stateful resources. */
  readonly protectData: boolean
}
