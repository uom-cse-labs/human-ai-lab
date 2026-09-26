# Infrastructure (AWS CDK)

All AWS resources for one environment, defined in TypeScript. Design: [technical design §7](../docs/architecture/technical-design.md).

| Stack | Region | Contents |
|---|---|---|
| `Hai-<Env>-Edge` | us-east-1 | AWS WAF web ACL (managed rules, per-IP rate limits) |
| `Hai-<Env>-Network` | ap-south-1 | VPC with private isolated subnets for the internal ALB only (no NAT) |
| `Hai-<Env>-Data` | ap-south-1 | DynamoDB table; `content`, `media`, `uploads` buckets (retained) |
| `Hai-<Env>-Auth` | ap-south-1 | Cognito user pool (invite-only, MFA), editor/admin groups, dashboard client |
| `Hai-<Env>-Api` | ap-south-1 | Content API Lambda (Java 21, SnapStart, alias `live`), internal ALB + Lambda target group |
| `Hai-<Env>-WebPublic` | ap-south-1 | Site bucket, CloudFront (WAF, OAC, SPA rewrite, `/api/contact` → VPC origin) |
| `Hai-<Env>-GithubOidc` | ap-south-1 | GitHub OIDC provider and the deploy role (one branch only) |
| `Hai-<Env>-Ops` | ap-south-1 | Monthly budget with email alerts |

Environment settings live in [`config/`](./config/) (`staging.ts`, `prod.ts`). Stack code never hard-codes environment values.

## Everyday commands

```bash
(cd ../services/content-api && ./gradlew build)   # the Api stack packages this zip
npx cdk synth -c env=staging                       # or env=prod
npm test                                           # security and architecture assertions
```

## First-time setup for an environment

Done once per AWS account by someone with administrator access through IAM Identity Center.

1. **Accounts.** Create the Organization, `hai-staging` and `hai-prod` accounts (technical design §7.5).
2. **Settings.** Put the account id in `config/<env>.ts` (or export `HAI_STAGING_ACCOUNT` / `HAI_PROD_ACCOUNT`), and set a **verified SES sender** in `mail.fromAddress`. `no-reply@example.org` is a placeholder.
3. **Bootstrap** both regions the stacks use:
   ```bash
   npx cdk bootstrap aws://<account>/ap-south-1 aws://<account>/us-east-1
   ```
4. **Deploy role first**, from a workstation, so GitHub can deploy the rest:
   ```bash
   npx cdk deploy -c env=staging Hai-Staging-GithubOidc
   ```
5. **Everything else**, from a workstation or the `Deploy to AWS` workflow:
   ```bash
   npx cdk deploy -c env=staging --all
   ```
6. **Tighten the ALB security group** to `CloudFront-VPCOrigins-Service-SG`, which exists once the VPC origin is created (see the comment in `api-stack.ts`).
7. **SES:** verify the sender and request production access (roadmap parallel track).

## Deploying from GitHub

`.github/workflows/deploy-aws.yml` runs on demand. It needs a GitHub Environment per AWS environment (`staging`, `prod`) with the variable `AWS_ACCOUNT_ID`. The role it assumes (`hai-<env>-github-deploy`) only trusts the configured branch: `dev` for staging, `main` for production.
