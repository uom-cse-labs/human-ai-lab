import { App, Tags } from 'aws-cdk-lib'
import type { EnvConfig } from '../config/index.ts'
import { ApiStack } from './stacks/api-stack.ts'
import { AuthStack } from './stacks/auth-stack.ts'
import { DataStack } from './stacks/data-stack.ts'
import { EdgeStack } from './stacks/edge-stack.ts'
import { GithubOidcStack } from './stacks/github-oidc-stack.ts'
import { NetworkStack } from './stacks/network-stack.ts'
import { OpsStack } from './stacks/ops-stack.ts'
import { WebPublicStack } from './stacks/web-public-stack.ts'

export interface PlatformOptions {
  readonly apiArtifactPath: string
}

/** Builds every stack of one environment (technical design §7.1). */
export function addPlatform(app: App, config: EnvConfig, options: PlatformOptions) {
  const prefix = `Hai-${config.name === 'prod' ? 'Prod' : 'Staging'}`
  const env = { account: config.account, region: config.region }
  const distributionIdParameterName = `/hai/${config.name}/public-distribution-id`

  const edge = new EdgeStack(app, `${prefix}-Edge`, {
    config,
    env: { account: config.account, region: 'us-east-1' },
    crossRegionReferences: true,
  })
  const network = new NetworkStack(app, `${prefix}-Network`, { env })
  const data = new DataStack(app, `${prefix}-Data`, { config, env })
  const auth = new AuthStack(app, `${prefix}-Auth`, { config, env })
  const api = new ApiStack(app, `${prefix}-Api`, {
    config,
    env,
    vpc: network.vpc,
    table: data.table,
    contentBucket: data.contentBucket,
    mediaBucket: data.mediaBucket,
    uploadsBucket: data.uploadsBucket,
    userPool: auth.userPool,
    dashboardClient: auth.dashboardClient,
    issuerUri: auth.issuerUri,
    apiArtifactPath: options.apiArtifactPath,
    distributionIdParameterName,
  })
  const web = new WebPublicStack(app, `${prefix}-WebPublic`, {
    config,
    env,
    crossRegionReferences: true,
    webAclArn: edge.webAclArn,
    alb: api.alb,
    contentBucketName: data.contentBucket.bucketName,
    mediaBucketName: data.mediaBucket.bucketName,
    distributionIdParameterName,
  })
  const github = new GithubOidcStack(app, `${prefix}-GithubOidc`, { config, env })
  const ops = new OpsStack(app, `${prefix}-Ops`, { config, env })

  for (const stack of [edge, network, data, auth, api, web, github, ops]) {
    Tags.of(stack).add('project', 'human-ai-lab')
    Tags.of(stack).add('environment', config.name)
  }
  return { edge, network, data, auth, api, web, github, ops }
}
