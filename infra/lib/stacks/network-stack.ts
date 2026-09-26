import { Stack, type StackProps } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import type { Construct } from 'constructs'

/**
 * A VPC that holds only the internal ALB (technical design §7.3). The Content API Lambda runs
 * outside the VPC, so there is no NAT gateway, internet gateway or VPC endpoint.
 */
export class NetworkStack extends Stack {
  readonly vpc: ec2.Vpc

  /** Fixed zones keep synthesis deterministic and free of AWS lookups. */
  override get availabilityZones(): string[] {
    return [`${this.region}a`, `${this.region}b`]
  }

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      restrictDefaultSecurityGroup: true,
      subnetConfiguration: [{ name: 'alb', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 }],
    })
  }
}
