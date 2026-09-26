import type { EnvConfig } from './types.ts'

export const prod: EnvConfig = {
  name: 'prod',
  account: process.env.HAI_PROD_ACCOUNT ?? '000000000000',
  region: 'ap-south-1',
  github: { repository: 'uom-cse-labs/human-ai-lab', branch: 'main' },
  api: { architecture: 'x86_64', memoryMiB: 2048, reservedConcurrency: 20 },
  waf: { apiRequestsPer5Min: 600, contactRequestsPer5Min: 10 },
  mail: {
    fromAddress: 'no-reply@example.org',
    toAddress: 'humanai@cse.mrt.ac.lk',
  },
  auth: {
    callbackUrls: ['http://localhost:6015/auth/callback'],
    logoutUrls: ['http://localhost:6015/'],
  },
  budget: { monthlyUsd: 60, alertEmails: ['humanai@cse.mrt.ac.lk'] },
  protectData: true,
}
