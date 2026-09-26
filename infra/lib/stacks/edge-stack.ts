import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import * as wafv2 from 'aws-cdk-lib/aws-wafv2'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface EdgeStackProps extends StackProps {
  readonly config: EnvConfig
}

/**
 * us-east-1 resources that CloudFront requires to live there: the AWS WAF web ACL
 * (and, from phase 6, ACM certificates). Replaces API Gateway throttling (technical design §7.3).
 */
export class EdgeStack extends Stack {
  readonly webAclArn: string

  constructor(scope: Construct, id: string, props: EdgeStackProps) {
    super(scope, id, props)
    const { config } = props

    const visibility = (metricName: string): wafv2.CfnWebACL.VisibilityConfigProperty => ({
      cloudWatchMetricsEnabled: true,
      sampledRequestsEnabled: true,
      metricName,
    })

    const managedRuleGroup = (
      priority: number,
      name: string,
      ruleActionOverrides?: wafv2.CfnWebACL.RuleActionOverrideProperty[],
    ): wafv2.CfnWebACL.RuleProperty => ({
      name,
      priority,
      overrideAction: { none: {} },
      statement: { managedRuleGroupStatement: { vendorName: 'AWS', name, ruleActionOverrides } },
      visibilityConfig: visibility(name),
    })

    const rateLimit = (priority: number, name: string, pathPrefix: string, limit: number): wafv2.CfnWebACL.RuleProperty => ({
      name,
      priority,
      action: { block: {} },
      statement: {
        rateBasedStatement: {
          limit,
          evaluationWindowSec: 300,
          aggregateKeyType: 'IP',
          scopeDownStatement: {
            byteMatchStatement: {
              searchString: pathPrefix,
              fieldToMatch: { uriPath: {} },
              positionalConstraint: 'STARTS_WITH',
              textTransformations: [{ priority: 0, type: 'NONE' }],
            },
          },
        },
      },
      visibilityConfig: visibility(name),
    })

    const acl = new wafv2.CfnWebACL(this, 'WebAcl', {
      name: `hai-${config.name}-edge`,
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      visibilityConfig: visibility(`hai-${config.name}-edge`),
      rules: [
        managedRuleGroup(0, 'AWSManagedRulesAmazonIpReputationList'),
        // Content bodies can exceed the rule set's 8 KB body limit; the API enforces its own limits.
        managedRuleGroup(1, 'AWSManagedRulesCommonRuleSet', [
          { name: 'SizeRestrictions_BODY', actionToUse: { count: {} } },
        ]),
        managedRuleGroup(2, 'AWSManagedRulesKnownBadInputsRuleSet'),
        rateLimit(10, 'contact-per-ip', '/api/contact', config.waf.contactRequestsPer5Min),
        rateLimit(11, 'api-per-ip', '/api/', config.waf.apiRequestsPer5Min),
      ],
    })

    this.webAclArn = acl.attrArn
    new CfnOutput(this, 'WebAclArn', { value: acl.attrArn })
  }
}
