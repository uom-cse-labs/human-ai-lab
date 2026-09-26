// Public entry point. Types come from contracts/openapi.yaml via `npm run generate`.
import type { components, paths } from './generated/api.ts'

export type { components, paths }

type Schemas = components['schemas']

export type ContentType = Schemas['ContentType']
export type ContentItem = Schemas['ContentItem']
export type ContentItemInput = Schemas['ContentItemInput']
export type MediaAsset = Schemas['MediaAsset']
export type Slot = Schemas['Slot']
export type Release = Schemas['Release']
export type User = Schemas['User']
export type Problem = Schemas['Problem']
export type ContactMessage = Schemas['ContactMessage']

// Published release files, read by the public website.
export type ReleasePointer = Schemas['ReleasePointer']
export type PublishedNewsFile = Schemas['PublishedNewsFile']
export type PublishedPublicationsFile = Schemas['PublishedPublicationsFile']
export type PublishedThemesFile = Schemas['PublishedThemesFile']
export type PublishedMembersFile = Schemas['PublishedMembersFile']
