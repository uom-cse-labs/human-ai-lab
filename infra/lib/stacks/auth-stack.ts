import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface AuthStackProps extends StackProps {
  readonly config: EnvConfig
}

/** Invite-only sign-in with required TOTP MFA and editor/admin groups (technical design §4.4, §9.1). */
export class AuthStack extends Stack {
  readonly userPool: cognito.UserPool
  readonly dashboardClient: cognito.UserPoolClient
  readonly issuerUri: string

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props)
    const { config } = props

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `hai-${config.name}-users`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { otp: true, sms: false },
      passwordPolicy: { minLength: 12, requireSymbols: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: config.protectData,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    for (const group of ['editor', 'admin']) {
      new cognito.CfnUserPoolGroup(this, `Group-${group}`, {
        userPoolId: this.userPool.userPoolId,
        groupName: group,
      })
    }

    this.dashboardClient = this.userPool.addClient('Dashboard', {
      generateSecret: false,
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(1),
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: config.auth.callbackUrls,
        logoutUrls: config.auth.logoutUrls,
      },
    })

    this.userPool.addDomain('Login', {
      cognitoDomain: { domainPrefix: `hai-${config.name}-${this.account}` },
    })

    this.issuerUri = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`
    new CfnOutput(this, 'IssuerUri', { value: this.issuerUri })
    new CfnOutput(this, 'DashboardClientId', { value: this.dashboardClient.userPoolClientId })
  }
}
