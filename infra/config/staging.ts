import type { EnvConfig } from './types.ts'

export const staging: EnvConfig = {
  name: 'staging',
  account: process.env.HAI_STAGING_ACCOUNT ?? '000000000000',
  region: 'ap-south-1',
  github: { repository: 'uom-cse-labs/human-ai-lab', branch: 'dev' },
  api: { architecture: 'x86_64', memoryMiB: 2048, reservedConcurrency: 5 },
  waf: { apiRequestsPer5Min: 600, contactRequestsPer5Min: 10 },
  mail: {
    fromAddress: 'no-reply@example.org',
    toAddress: 'humanai@cse.mrt.ac.lk',
  },
  auth: {
    callbackUrls: ['http://localhost:6015/auth/callback'],
    logoutUrls: ['http://localhost:6015/'],
  },
  budget: { monthlyUsd: 40, alertEmails: ['humanai@cse.mrt.ac.lk'] },
  protectData: false,
}
