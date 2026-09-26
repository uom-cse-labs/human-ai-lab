import { Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface DataStackProps extends StackProps {
  readonly config: EnvConfig
}

/**
 * Stateful resources (technical design Appendix A). Everything here is retained if the stack is deleted.
 */
export class DataStack extends Stack {
  readonly table: dynamodb.Table
  readonly contentBucket: s3.Bucket
  readonly mediaBucket: s3.Bucket
  readonly uploadsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props)
    const { config } = props

    this.table = new dynamodb.Table(this, 'ContentTable', {
      tableName: `hai-${config.name}-content`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      deletionProtection: config.protectData,
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.RETAIN,
    })
    this.table.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: { name: 'gsi1pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'gsi1sk', type: dynamodb.AttributeType.STRING },
    })

    const privateBucket = (name: string, extra: Partial<s3.BucketProps> = {}) =>
      new s3.Bucket(this, name, {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        versioned: true,
        objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
        removalPolicy: RemovalPolicy.RETAIN,
        ...extra,
      })

    this.contentBucket = privateBucket('ContentBucket')
    this.mediaBucket = privateBucket('MediaBucket')
    this.uploadsBucket = privateBucket('UploadsBucket', {
      lifecycleRules: [
        { transitions: [{ storageClass: s3.StorageClass.INFREQUENT_ACCESS, transitionAfter: Duration.days(30) }] },
        { abortIncompleteMultipartUploadAfter: Duration.days(1) },
      ],
    })

    // CloudFront (Origin Access Control) may read published content and media. The distribution lives in
    // another stack, and naming it here would create a dependency cycle, so the grant covers
    // distributions in this account only. The account holds nothing but this environment.
    for (const bucket of [this.contentBucket, this.mediaBucket]) {
      bucket.addToResourcePolicy(new iam.PolicyStatement({
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        conditions: {
          StringEquals: { 'AWS:SourceAccount': this.account },
          ArnLike: { 'AWS:SourceArn': `arn:${this.partition}:cloudfront::${this.account}:distribution/*` },
        },
      }))
    }
    // The uploads bucket is deliberately never readable by CloudFront.
  }
}
