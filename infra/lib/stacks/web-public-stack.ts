import { Annotations, CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import type * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface WebPublicStackProps extends StackProps {
  readonly config: EnvConfig
  readonly webAclArn: string
  readonly alb: elbv2.IApplicationLoadBalancer
  readonly contentBucketName: string
  readonly mediaBucketName: string
  readonly distributionIdParameterName: string
}

/** URLs without a file extension are app routes: serve index.html (real missing files still 404). */
const SPA_REWRITE = `
function handler(event) {
  var request = event.request;
  var last = request.uri.split('/').pop();
  if (last.indexOf('.') === -1) {
    request.uri = '/index.html';
  }
  return request;
}`

/** Public website distribution and routing (technical design §7.2). */
export class WebPublicStack extends Stack {
  readonly siteBucket: s3.Bucket
  readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props: WebPublicStackProps) {
    super(scope, id, props)
    const { config } = props

    // Rebuilt from Git on every deploy, so it is safe to delete with the stack.
    this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: `hai-${config.name}-web-public-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Bucket policies for these are granted in the Data stack (see the comment there).
    const contentBucket = s3.Bucket.fromBucketName(this, 'ContentBucket', props.contentBucketName)
    const mediaBucket = s3.Bucket.fromBucketName(this, 'MediaBucket', props.mediaBucketName)

    const spaRewrite = new cloudfront.Function(this, 'SpaRewrite', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(SPA_REWRITE),
    })

    const apiOrigin = origins.VpcOrigin.withApplicationLoadBalancer(props.alb, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      httpPort: 80,
      readTimeout: Duration.seconds(30),
    })

    const fileBehavior = (bucket: s3.IBucket): cloudfront.BehaviorOptions => ({
      origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      compress: true,
    })

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `hai-${config.name} public website`,
      webAclId: props.webAclArn,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        ...fileBehavior(this.siteBucket),
        functionAssociations: [{ function: spaRewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
      },
      additionalBehaviors: {
        '/content/*': fileBehavior(contentBucket),
        '/media/*': fileBehavior(mediaBucket),
        '/api/contact': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        },
      },
    })

    Annotations.of(this).acknowledgeWarning(
      '@aws-cdk/aws-cloudfront-origins:updateImportedBucketPolicyOac',
      'Content and media bucket policies grant CloudFront access in the Data stack',
    )

    new ssm.StringParameter(this, 'DistributionIdParameter', {
      parameterName: props.distributionIdParameterName,
      stringValue: this.distribution.distributionId,
    })

    new CfnOutput(this, 'SiteBucketName', { value: this.siteBucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: this.distribution.distributionId })
    new CfnOutput(this, 'Url', { value: `https://${this.distribution.distributionDomainName}` })
  }
}
