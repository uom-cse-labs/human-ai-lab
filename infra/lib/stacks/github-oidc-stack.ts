import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface GithubOidcStackProps extends StackProps {
  readonly config: EnvConfig
}

/**
 * Lets GitHub Actions deploy without stored AWS keys (technical design §6.6): one branch of one repository
 * may assume a short-lived role that can use the CDK bootstrap roles and publish the website files.
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props)
    const { config } = props

    const provider = new iam.OidcProviderNative(this, 'GitHub', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    })

    const role = new iam.Role(this, 'DeployRole', {
      roleName: `hai-${config.name}-github-deploy`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${config.github.repository}:ref:refs/heads/${config.github.branch}`,
        },
      }),
    })

    role.addToPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [`arn:${this.partition}:iam::${this.account}:role/cdk-hnb659fds-*-${this.account}-*`],
    }))
    const siteBucketArn = `arn:${this.partition}:s3:::hai-${config.name}-web-public-${this.account}`
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:ListBucket'],
      resources: [siteBucketArn],
    }))
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:PutObject', 's3:DeleteObject'],
      resources: [`${siteBucketArn}/*`],
    }))
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['cloudfront:CreateInvalidation', 'cloudformation:DescribeStacks'],
      resources: ['*'],
    }))

    new CfnOutput(this, 'DeployRoleArn', { value: role.roleArn })
  }
}
