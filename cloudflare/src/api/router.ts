/**
 * The Content API's routes under /api (contracts/openapi.yaml), for a signed-in user. Runs inside the
 * ContentStore Durable Object; sign-in and the public contact form are handled by the Worker before this.
 */
import type { User } from './access.ts'
import type { ContentService } from './content.ts'
import { ApiError, forbidden, problemResponse } from './errors.ts'
import { type MediaService, src, thumbnailSrc } from './media.ts'
import { type ContentItem, isContentType, type MediaAsset, type Release } from './model.ts'
import type { PublishService } from './publishing.ts'
import * as check from './validation.ts'

export interface Services {
  contents: ContentService
  media: MediaService
  publishing: PublishService
}

type Handler = (request: Request, params: string[], url: URL, user: User) => Promise<Response> | Response

export class Router {
  private readonly routes: { method: string; pattern: RegExp; handler: Handler }[] = []

  constructor(services: Services) {
    const { contents, media, publishing } = services
    const type = (value: string) => {
      if (!isContentType(value)) {
        throw new ApiError(404, 'NOT_FOUND', 'There is no such content type.')
      }
      return value
    }

    this.add('GET', '/session', (_r, _p, _u, user) => json(200, user))

    // ---------------------------------------------------------------- content
    this.add('GET', '/content/([^/]+)', (_r, [t], url) => {
      const { cursor, limit } = check.paging(url)
      const result = contents.list(type(t), cursor, limit)
      return json(200, { items: result.items.map(contentDto), nextCursor: result.nextCursor })
    })
    this.add('POST', '/content/([^/]+)', async (r, [t], _u, user) => {
      const kind = type(t)
      const draft = check.contentDraft(await check.readJson(r))
      return json(201, contentDto(contents.create(kind, draft, user.name)))
    })
    this.add('GET', '/content/([^/]+)/([^/]+)', (_r, [t, id]) => json(200, contentDto(contents.get(type(t), check.checkId(id)))))
    this.add('PUT', '/content/([^/]+)/([^/]+)', async (r, [t, id], _u, user) => {
      const kind = type(t)
      const version = check.ifMatch(r)
      const draft = check.contentDraft(await check.readJson(r))
      return json(200, contentDto(contents.update(kind, check.checkId(id), draft, version, user.name)))
    })
    this.add('DELETE', '/content/([^/]+)/([^/]+)', (_r, [t, id], _u, user) => {
      requireAdmin(user)
      contents.delete(type(t), check.checkId(id))
      return new Response(null, { status: 204 })
    })
    this.add('POST', '/content/([^/]+)/([^/]+)/unpublish', (_r, [t, id], _u, user) => {
      requireAdmin(user)
      return json(200, contentDto(contents.unpublish(type(t), check.checkId(id), user.name)))
    })

    // ---------------------------------------------------------------- media
    this.add('GET', '/media', (_r, _p, url) => {
      const { cursor, limit } = check.paging(url)
      const result = media.list(cursor, limit)
      return json(200, { items: result.items.map(mediaDto), nextCursor: result.nextCursor })
    })
    this.add('POST', '/media/uploads', async (r, _p, _u, user) => {
      const request = check.uploadRequest(await check.readJson(r))
      const { asset, target } = media.startUpload(request.fileName, request.contentType, request.sizeBytes, user.name)
      return json(201, {
        mediaId: asset.id,
        uploadId: target.uploadId,
        partSizeBytes: request.sizeBytes,
        parts: [{ partNumber: 1, url: target.url }],
        expiresAt: target.expiresAt,
      })
    })
    this.add('PUT', '/media/([^/]+)/upload', async (r, [id]) => {
      await media.receiveUpload(check.checkId(id), r.body)
      return new Response(null, { status: 200, headers: { etag: `"upload-${id}"` } })
    })
    this.add('POST', '/media/([^/]+)/complete', async (r, [id]) => {
      check.uploadCompletion(await check.readJson(r))
      return json(200, mediaDto(await media.completeUpload(check.checkId(id))))
    })
    this.add('POST', '/media/embeds', () => {
      throw new ApiError(409, 'NOT_AVAILABLE', 'Video links arrive with video support. For now, add videos as links in the article text.')
    })
    this.add('GET', '/media/([^/]+)', (_r, [id]) => json(200, mediaDto(media.get(check.checkId(id)))))
    this.add('PATCH', '/media/([^/]+)', async (r, [id]) => {
      const update = check.mediaUpdate(await check.readJson(r))
      return json(200, mediaDto(media.describe(check.checkId(id), update.altText, update.caption)))
    })
    this.add('DELETE', '/media/([^/]+)', async (_r, [id], _u, user) => {
      requireAdmin(user)
      await media.delete(check.checkId(id))
      return new Response(null, { status: 204 })
    })
    this.add('GET', '/media/([^/]+)/usage', (_r, [id]) => {
      media.get(check.checkId(id))
      return json(200, media.usage(id).map((u) => ({ kind: u.kind, ref: u.ref })))
    })
    this.add('POST', '/media/([^/]+)/retry', async (_r, [id], _u, user) => {
      requireAdmin(user)
      return json(202, mediaDto(await media.retry(check.checkId(id))))
    })

    // ---------------------------------------------------------------- releases
    this.add('POST', '/publish', async (r, _p, _u, user) => {
      requireAdmin(user)
      const { note } = check.publishRequest(await check.readJson(r, { optional: true }))
      const release = await publishing.publish(note, user.name)
      return json(201, releaseDto(release, release.id))
    })
    this.add('GET', '/releases', async (_r, _p, url, user) => {
      requireAdmin(user)
      const { cursor, limit } = check.paging(url)
      const result = publishing.list(cursor, limit)
      const current = await publishing.currentReleaseId()
      return json(200, { items: result.items.map((r) => releaseDto(r, current)), nextCursor: result.nextCursor })
    })
    this.add('POST', '/releases/([^/]+)/restore', async (_r, [id], _u, user) => {
      requireAdmin(user)
      const release = await publishing.restore(check.checkId(id))
      return json(200, releaseDto(release, release.id))
    })
  }

  /**
   * Answers one /api request for a signed-in user. The user is passed along rather than kept on the router:
   * a Durable Object interleaves requests whenever one waits for R2.
   */
  async handle(request: Request, user: User): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api/, '')
    try {
      const matching = this.routes.filter((r) => r.pattern.test(path))
      if (!matching.length) {
        return problemResponse(404, 'NOT_FOUND', `There is no ${path} in the API.`)
      }
      const route = matching.find((r) => r.method === request.method)
      if (!route) {
        return problemResponse(405, 'METHOD_NOT_ALLOWED', `${request.method} is not supported here.`)
      }
      const params = path.match(route.pattern)!.slice(1).map(decodeURIComponent)
      return await route.handler(request, params, url, user)
    } catch (e) {
      if (e instanceof ApiError) {
        return e.toResponse()
      }
      console.error(`${request.method} ${url.pathname} failed`, e)
      return problemResponse(500, 'INTERNAL_ERROR', 'Something went wrong on our side. Try again; if it keeps happening, tell the site maintainer.')
    }
  }

  private add(method: string, path: string, handler: Handler) {
    this.routes.push({ method, pattern: new RegExp(`^${path}$`), handler })
  }

}

function requireAdmin(user: User) {
  if (user.role !== 'admin') {
    throw forbidden()
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

// ------------------------------------------------------------------------------------ response shapes

function contentDto(item: ContentItem) {
  return {
    id: item.id,
    type: item.type,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    body: item.body,
    fields: item.fields,
    mediaRefs: item.mediaRefs,
    status: item.status,
    version: item.version,
    publishedVersion: item.publishedVersion,
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt,
  }
}

function mediaDto(asset: MediaAsset) {
  return {
    id: asset.id,
    kind: asset.kind,
    status: asset.status,
    failureReason: asset.failureReason,
    fileName: asset.fileName,
    src: src(asset),
    thumbnailSrc: thumbnailSrc(asset),
    altText: asset.altText,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
    renditions: asset.renditions.map((r) => ({ key: r.src, src: r.src, format: r.format, role: r.role, width: r.width, bytes: r.bytes })),
    uploadedBy: asset.uploadedBy,
    createdAt: asset.createdAt,
  }
}

function releaseDto(release: Release, currentId: string | undefined) {
  return { ...release, isCurrent: release.id === currentId }
}
