import { Annotations, CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface ApiStackProps extends StackProps {
  readonly config: EnvConfig
  readonly vpc: ec2.IVpc
  readonly table: dynamodb.ITable
  readonly contentBucket: s3.IBucket
  readonly mediaBucket: s3.IBucket
  readonly uploadsBucket: s3.IBucket
  readonly userPool: cognito.IUserPool
  readonly dashboardClient: cognito.IUserPoolClient
  readonly issuerUri: string
  /** Path to services/content-api/build/distributions/content-api.zip */
  readonly apiArtifactPath: string
  /** SSM parameter (written by WebPublic) holding the public distribution id, read when publishing. */
  readonly distributionIdParameterName: string
}

/**
 * Content API: Java 21 Lambda (SnapStart) as the target of an internal ALB. CloudFront reaches the ALB
 * through a VPC origin; there is no API Gateway and no Function URL (ADR-17, technical design §7.3–7.4).
 */
export class ApiStack extends Stack {
  readonly alb: elbv2.ApplicationLoadBalancer

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)
    const { config } = props

    const fn = new lambda.Function(this, 'ContentApi', {
      functionName: `hai-${config.name}-content-api`,
      runtime: lambda.Runtime.JAVA_21,
      architecture: config.api.architecture === 'arm64' ? lambda.Architecture.ARM_64 : lambda.Architecture.X86_64,
      handler: 'lk.ac.mrt.cse.hai.api.LambdaHandler::handleRequest',
      code: lambda.Code.fromAsset(props.apiArtifactPath),
      memorySize: config.api.memoryMiB,
      timeout: Duration.seconds(30),
      snapStart: lambda.SnapStartConf.ON_PUBLISHED_VERSIONS,
      reservedConcurrentExecutions: config.api.reservedConcurrency,
      logGroup: new logs.LogGroup(this, 'ContentApiLogs', {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      environment: {
        COGNITO_ISSUER_URI: props.issuerUri,
        COGNITO_CLIENT_ID: props.dashboardClient.userPoolClientId,
        MAIL_PROVIDER: 'ses',
        MAIL_FROM_ADDRESS: config.mail.fromAddress,
        MAIL_TO_ADDRESS: config.mail.toAddress,
        TABLE_NAME: props.table.tableName,
        CONTENT_BUCKET: props.contentBucket.bucketName,
        MEDIA_BUCKET: props.mediaBucket.bucketName,
        UPLOADS_BUCKET: props.uploadsBucket.bucketName,
        DISTRIBUTION_ID_PARAMETER: props.distributionIdParameterName,
        JAVA_TOOL_OPTIONS: '-XX:+TieredCompilation -XX:TieredStopAtLevel=1',
      },
    })

    // Least privilege (technical design §7.4).
    props.table.grantReadWriteData(fn)
    props.contentBucket.grantReadWrite(fn)
    props.mediaBucket.grantRead(fn)
    props.uploadsBucket.grantReadWrite(fn)
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: [`arn:${this.partition}:ses:${this.region}:${this.account}:identity/*`],
      conditions: { StringEquals: { 'ses:FromAddress': config.mail.fromAddress } },
    }))
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminCreateUser', 'cognito-idp:AdminGetUser', 'cognito-idp:ListUsers',
        'cognito-idp:AdminAddUserToGroup', 'cognito-idp:AdminRemoveUserFromGroup',
        'cognito-idp:AdminListGroupsForUser', 'cognito-idp:AdminDisableUser', 'cognito-idp:AdminEnableUser',
      ],
      resources: [props.userPool.userPoolArn],
    }))
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cloudfront:CreateInvalidation'],
      resources: [`arn:${this.partition}:cloudfront::${this.account}:distribution/*`],
    }))
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:${this.partition}:ssm:${this.region}:${this.account}:parameter${props.distributionIdParameterName}`],
    }))

    // Every deploy publishes a version (SnapStart snapshot); the ALB targets the alias.
    Annotations.of(fn).acknowledgeWarning('@aws-cdk/aws-lambda:snapStartRequirePublish', 'The live alias always points at a published version')
    const live = new lambda.Alias(this, 'Live', { aliasName: 'live', version: fn.currentVersion })

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      description: 'Internal ALB for the Content API; reachable only from inside the VPC',
      allowAllOutbound: false,
    })
    // The VPC's only other network interfaces are CloudFront's VPC-origin ENIs. Their security group
    // (CloudFront-VPCOrigins-Service-SG) exists only after the VPC origin is created, so the first deploy
    // allows the VPC range; narrow this to that group once it exists (technical design §7.3).
    albSecurityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(80), 'CloudFront VPC origin')

    const accessLogs = new s3.Bucket(this, 'AlbAccessLogs', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: Duration.days(90) }],
      removalPolicy: RemovalPolicy.RETAIN,
    })

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      loadBalancerName: `hai-${config.name}-api`,
      vpc: props.vpc,
      internetFacing: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroup: albSecurityGroup,
      dropInvalidHeaderFields: true,
    })
    this.alb.logAccessLogs(accessLogs)

    const apiTargets = new elbv2.ApplicationTargetGroup(this, 'ApiTargets', {
      targets: [new targets.LambdaTarget(live)],
      // Health checks would invoke the function; availability is watched through Lambda and ALB metrics.
      healthCheck: { enabled: false },
    })
    apiTargets.setAttribute('lambda.multi_value_headers.enabled', 'true')

    // HTTP inside AWS's private network until the origin certificate exists (phase 6: HTTPS :443).
    const listener = this.alb.addListener('Http', {
      port: 80,
      open: false,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'application/json',
        messageBody: '{"code":"NOT_FOUND"}',
      }),
    })
    listener.addTargetGroups('Api', {
      priority: 10,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      targetGroups: [apiTargets],
    })

    new CfnOutput(this, 'ContentApiFunction', { value: fn.functionName })
    new CfnOutput(this, 'InternalAlbDns', { value: this.alb.loadBalancerDnsName })
  }
}
