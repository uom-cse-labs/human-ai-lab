# Contracts

`openapi.yaml` is the single source of truth for the Content API and for the JSON release files the public site reads (ADR-15 in the [technical design](../docs/architecture/technical-design.md)).

Code generated from it is never edited by hand:

| Consumer | Generated code | How |
|---|---|---|
| Website, dashboard, media processor | `packages/content-schema/src/generated/api.ts` | `npm run contracts:generate` (openapi-typescript) |
| Content API (Java) | `services/content-api/build/generated/openapi` | Generated on every Gradle build (OpenAPI Generator, `spring` interfaces) |

After editing `openapi.yaml`, run `npm run contracts:generate`, rebuild the API, and commit the regenerated TypeScript file. CI fails if it is out of date.
