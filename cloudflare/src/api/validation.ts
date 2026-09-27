/**
 * Request checks from contracts/openapi.yaml, with the same codes and messages as the Java service's bean
 * validation: 400 VALIDATION_FAILED listing every field, or MALFORMED_REQUEST when the body isn't usable.
 */
import { ApiError, type FieldError } from './errors.ts'
import type { ContactMessage } from './contact.ts'
import type { ContentDraft } from './model.ts'

type Json = Record<string, unknown>

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Same idea as Hibernate Validator's @Email: something@something, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+$/

export async function readJson(request: Request, { optional = false } = {}): Promise<Json> {
  const text = await request.text()
  if (!text.trim() && optional) {
    return {}
  }
  try {
    const value: unknown = JSON.parse(text)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Json
    }
  } catch {
    // Fall through.
  }
  throw malformed()
}

export function contentDraft(body: Json): ContentDraft {
  const check = new Checker(body)
  const slug = check.string('slug', { required: true, max: 120, pattern: SLUG })
  const title = check.string('title', { required: true, min: 1, max: 300 })
  const summary = check.string('summary', { max: 1000 })
  const draftBody = check.string('body', { max: 200_000 })
  const mediaRefs = body.mediaRefs ?? []
  if (!Array.isArray(mediaRefs) || mediaRefs.some((r) => typeof r !== 'string')) {
    throw malformed()
  }
  const fields = body.fields ?? {}
  if (typeof fields !== 'object' || Array.isArray(fields) || fields === null) {
    throw malformed()
  }
  check.done()
  return {
    slug: slug!,
    title: title!,
    ...(summary !== undefined ? { summary } : {}),
    ...(draftBody !== undefined ? { body: draftBody } : {}),
    fields: fields as Record<string, unknown>,
    mediaRefs: mediaRefs as string[],
  }
}

export function uploadRequest(body: Json): { fileName: string; contentType: string; sizeBytes: number } {
  const check = new Checker(body)
  const fileName = check.string('fileName', { required: true, max: 255 })
  const contentType = check.string('contentType', { required: true })
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm']
  if (contentType !== undefined && !allowed.includes(contentType)) {
    throw malformed()
  }
  const sizeBytes = check.integer('sizeBytes', { required: true, min: 1 })
  check.done()
  return { fileName: fileName!, contentType: contentType!, sizeBytes: sizeBytes! }
}

export function uploadCompletion(body: Json): void {
  const check = new Checker(body)
  check.string('uploadId', { required: true })
  if (body.parts === undefined || body.parts === null) {
    check.missing('parts')
  } else if (!Array.isArray(body.parts)) {
    throw malformed()
  }
  check.done()
}

export function mediaUpdate(body: Json): { altText?: string; caption?: string } {
  const check = new Checker(body)
  const altText = check.string('altText', { min: 1, max: 500 })
  const caption = check.string('caption', { max: 1000 })
  check.done()
  return { altText, caption }
}

export function publishRequest(body: Json): { note?: string } {
  const check = new Checker(body)
  const note = check.string('note', { max: 500 })
  check.done()
  return { note }
}

export function contactMessage(body: Json): ContactMessage {
  const check = new Checker(body)
  const name = check.string('name', { required: true, min: 1, max: 200 })
  const email = check.string('email', { required: true, max: 254 })
  if (email !== undefined && !EMAIL.test(email)) {
    check.fail('email', 'must be a well-formed email address')
  }
  const subject = check.string('subject', { max: 200 })
  const message = check.string('message', { required: true, min: 1, max: 5000 })
  const website = check.string('website', { max: 200 })
  check.done()
  return { name: name!, email: email!, subject, message: message!, website }
}

/** limit: 1–100, default 25; cursor: an offset. */
export function paging(url: URL): { cursor?: string; limit: number } {
  const rawLimit = url.searchParams.get('limit')
  const limit = rawLimit === null ? 25 : Number(rawLimit)
  const cursor = url.searchParams.get('cursor') ?? undefined
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || (cursor !== undefined && !/^\d+$/.test(cursor))) {
    throw invalidParameter()
  }
  return { cursor, limit }
}

export function ifMatch(request: Request): number {
  const header = request.headers.get('If-Match')
  if (header === null) {
    throw new ApiError(428, 'PRECONDITION_REQUIRED', 'Send the version you edited in the If-Match header.')
  }
  const version = Number(header.replace(/^W\//, '').replaceAll('"', ''))
  if (!Number.isInteger(version) || version < 1) {
    throw invalidParameter()
  }
  return version
}

export function checkId(id: string): string {
  if (id.length < 1 || id.length > 64) {
    throw invalidParameter()
  }
  return id
}

export const malformed = () => new ApiError(400, 'MALFORMED_REQUEST', 'The request body is not valid JSON for this endpoint.')
export const invalidParameter = () => new ApiError(400, 'VALIDATION_FAILED', 'A path or query parameter is invalid.')

class Checker {
  private readonly errors: FieldError[] = []

  constructor(private readonly body: Json) {}

  string(field: string, rules: { required?: boolean; min?: number; max?: number; pattern?: RegExp }): string | undefined {
    const value = this.body[field]
    if (value === undefined || value === null) {
      if (rules.required) this.missing(field)
      return undefined
    }
    if (typeof value !== 'string') {
      throw malformed()
    }
    const length = value.length // UTF-16 units, as Java counts
    if ((rules.min !== undefined && length < rules.min) || (rules.max !== undefined && length > rules.max)) {
      this.fail(field, `size must be between ${rules.min ?? 0} and ${rules.max ?? 2147483647}`)
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      this.fail(field, `must match "${rules.pattern.source}"`)
    }
    return value
  }

  integer(field: string, rules: { required?: boolean; min?: number }): number | undefined {
    const value = this.body[field]
    if (value === undefined || value === null) {
      if (rules.required) this.missing(field)
      return undefined
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw malformed()
    }
    if (rules.min !== undefined && value < rules.min) {
      this.fail(field, `must be greater than or equal to ${rules.min}`)
    }
    return value
  }

  missing(field: string) {
    this.fail(field, 'must not be null')
  }

  fail(field: string, message: string) {
    this.errors.push({ field, message })
  }

  done() {
    if (this.errors.length) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'Some fields are missing or invalid.', this.errors)
    }
  }
}
