# Content API

Java 21 · Spring Boot 4 · AWS Lambda. The internal ALB invokes the function through a Lambda target group; there is no API Gateway (ADR-17 in the [technical design](../../docs/architecture/technical-design.md), §7.3–7.4).

## Layout

```
src/main/java/lk/ac/mrt/cse/hai/api/
├── LambdaHandler.java     ALB event → Spring (aws-serverless-java-container)
├── web/                   controllers implementing the generated contract interfaces; problem details
├── security/              Cognito JWT validation and role mapping (replaces API Gateway's authorizer)
├── domain/                use cases and ports; no Spring or AWS imports (enforced by ArchUnit)
├── adapters/              port implementations (SES, logging; DynamoDB and S3 to come)
└── config/                wiring and settings
```

Interfaces and DTOs under `lk.ac.mrt.cse.hai.api.contract` are generated from [`contracts/openapi.yaml`](../../contracts/openapi.yaml) at build time.

## Commands

| Command | What it does |
|---|---|
| `./gradlew build` | Compile, test, and package `build/distributions/content-api.zip` for Lambda |
| `./gradlew test` | Unit, security, architecture and ALB-event tests |
| `./gradlew bootRun` | Run locally on port 8080 with the `local` profile (emails are logged, not sent) |
| `./gradlew bootJar` | Package the runnable jar used by the Cloudflare container image ([Dockerfile](Dockerfile)) |

`bootRun` accepts tokens from a local OAuth2 server at `http://localhost:9000/default`, such as
`docker run -p 9000:8080 ghcr.io/navikt/mock-oauth2-server`. The public contact endpoint works without one:

```bash
curl -X POST localhost:8080/api/contact -H 'content-type: application/json' \
  -d '{"name":"Asha","email":"asha@example.com","message":"Hello"}'
```

## Local storage

With the `local` profile (`bootRun`), `hai.storage=local` stores drafts, releases and the release history as files in `../../.local-data/`, laid out as in the S3 content bucket, and serves `/content/*` like CloudFront. Sign-in is simulated: the `X-Local-Role` header (`admin` or `editor`) chooses the role. This profile refuses to start inside Lambda.

## Cloudflare

The `cloudflare` profile ([application-cloudflare.yml](src/main/resources/application-cloudflare.yml)) runs the same file adapters with `hai.storage=r2`. The data folder is a working copy on the container's disk, every write is also sent to R2 (`R2Mirror`), and the folder is restored from R2 on start. Sign-in is Cloudflare Access: the `Cf-Access-Jwt-Assertion` token is validated here, and `ADMIN_EMAILS` decides who is an admin. Contact mail goes through Brevo's HTTPS API. The deployment itself is described in [cloudflare/README.md](../../cloudflare/README.md).

## Status

Implemented: drafts for news, publications, research themes and people, with optimistic locking and per-type publish rules; publish and rollback (admin only); media library with photo upload and processing (re-encoded, EXIF removed, web sizes); contact endpoint, Cognito security, ALB/Lambda integration. Storage adapters exist for local files only; in AWS the content endpoints stay off until the DynamoDB and S3 adapters land. Media, slots, users and audit come next.
