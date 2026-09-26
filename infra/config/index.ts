import { prod } from './prod.ts'
import { staging } from './staging.ts'
import type { EnvConfig, EnvName } from './types.ts'

export type { EnvConfig, EnvName } from './types.ts'

const configs: Record<EnvName, EnvConfig> = { staging, prod }

export function loadConfig(name: string): EnvConfig {
  if (name !== 'staging' && name !== 'prod') {
    throw new Error(`Unknown environment "${name}". Use -c env=staging or -c env=prod.`)
  }
  return configs[name]
}
