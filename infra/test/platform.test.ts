import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadConfig } from '../config/index.ts'
import { addPlatform } from '../lib/platform.ts'

let t: Record<'edge' | 'network' | 'data' | 'auth' | 'api' | 'web' | 'github', Template>

beforeAll(() => {
  const artifact = join(mkdtempSync(join(tmpdir(), 'hai-')), 'content-api.zip')
  writeFileSync(artifact, 'placeholder')
  const app = new App()
  const stacks = addPlatform(app, loadConfig('prod'), { apiArtifactPath: artifact })
  t = {
    edge: Template.fromStack(stacks.edge),
    network: Template.fromStack(stacks.network),
    data: Template.fromStack(stacks.data),
    auth: Template.fromStack(stacks.auth),
    api: Template.fromStack(stacks.api),
    web: Template.fromStack(stacks.web),
    github: Template.fromStack(stacks.github),
  }
})

describe('no API Gateway (ADR-17)', () => {
  it('has no API Gateway resources or Lambda Function URLs anywhere', () => {
    for (const template of Object.values(t)) {
      const types = Object.values(template.toJSON().Resources ?? {}).map((r) => (r as { Type: string }).Type)
      expect(types.filter((type) => type.startsWith('AWS::ApiGateway'))).toEqual([])
      expect(types).not.toContain('AWS::Lambda::Url')
    }
  })
})

describe('Content API', () => {
  it('runs Java 21 with SnapStart on published versions', () => {
    t.api.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'java21',
      SnapStart: { ApplyOn: 'PublishedVersions' },
      ReservedConcurrentExecutions: 20,
    })
  })

  it('sits behind an internal ALB with a Lambda target group and multi-value headers', () => {
    t.api.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', { Scheme: 'internal' })
    t.api.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      TargetType: 'lambda',
      HealthCheckEnabled: false,
      TargetGroupAttributes: Match.arrayWith([{ Key: 'lambda.multi_value_headers.enabled', Value: 'true' }]),
    })
  })

  it('can only be invoked by the load balancer', () => {
    const permissions = t.api.findResources('AWS::Lambda::Permission')
    expect(Object.keys(permissions).length).toBeGreaterThan(0)
    for (const permission of Object.values(permissions)) {
      expect(permission.Properties.Principal).toBe('elasticloadbalancing.amazonaws.com')
    }
  })

  it('does not accept traffic from outside the VPC', () => {
    const groups = t.api.findResources('AWS::EC2::SecurityGroup')
    for (const group of Object.values(groups)) {
      for (const rule of group.Properties.SecurityGroupIngress ?? []) {
        expect(rule.CidrIp).not.toBe('0.0.0.0/0')
      }
    }
  })
})

describe('network', () => {
  it('has no NAT or internet gateway', () => {
    t.network.resourceCountIs('AWS::EC2::NatGateway', 0)
    t.network.resourceCountIs('AWS::EC2::InternetGateway', 0)
  })
})

describe('data', () => {
  it('blocks all public access and retains every bucket', () => {
    const buckets = t.data.findResources('AWS::S3::Bucket')
    expect(Object.keys(buckets)).toHaveLength(3)
    for (const bucket of Object.values(buckets)) {
      expect(bucket.DeletionPolicy).toBe('Retain')
      expect(bucket.Properties.PublicAccessBlockConfiguration).toEqual({
        BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true,
      })
      expect(bucket.Properties.VersioningConfiguration).toEqual({ Status: 'Enabled' })
    }
  })

  it('protects the content table in production', () => {
    t.data.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
      Properties: Match.objectLike({
        DeletionProtectionEnabled: true,
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    })
  })
})

describe('identity', () => {
  it('is invite-only with required MFA', () => {
    t.auth.hasResourceProperties('AWS::Cognito::UserPool', {
      AdminCreateUserConfig: { AllowAdminCreateUserOnly: true },
      MfaConfiguration: 'ON',
      EnabledMfas: ['SOFTWARE_TOKEN_MFA'],
    })
    t.auth.resourceCountIs('AWS::Cognito::UserPoolGroup', 2)
  })
})

describe('edge', () => {
  it('rate-limits the contact form and the API per IP', () => {
    t.edge.hasResourceProperties('AWS::WAFv2::WebACL', {
      Scope: 'CLOUDFRONT',
      Rules: Match.arrayWith([
        Match.objectLike({
          Name: 'contact-per-ip',
          Statement: { RateBasedStatement: Match.objectLike({ Limit: 10, AggregateKeyType: 'IP' }) },
        }),
        Match.objectLike({ Name: 'api-per-ip' }),
      ]),
    })
  })
})

describe('public website', () => {
  it('uses WAF, a VPC origin for the API and private S3 origins', () => {
    t.web.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ WebACLId: Match.anyValue() }),
    })
    t.web.resourceCountIs('AWS::CloudFront::VpcOrigin', 1)
    t.web.resourceCountIs('AWS::CloudFront::OriginAccessControl', 3)
  })
})

describe('deployments', () => {
  it('trusts only the main branch of the lab repository', () => {
    t.github.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Condition: Match.objectLike({
              StringLike: { 'token.actions.githubusercontent.com:sub': 'repo:uom-cse-labs/human-ai-lab:ref:refs/heads/main' },
            }),
          }),
        ]),
      }),
    })
  })
})
