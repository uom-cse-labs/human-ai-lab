/** The HTTP contract, end to end through the router (ported from ContentApiTest and ApiSecurityTest). */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { User } from '../../src/api/access.ts'
import { ContentService } from '../../src/api/content.ts'
import { OriginalSizeProcessor } from '../../src/api/images.ts'
import { MediaService } from '../../src/api/media.ts'
import { PublishService } from '../../src/api/publishing.ts'
import { Router } from '../../src/api/router.ts'
import { MemoryFiles, MemoryStore } from '../../src/api/store.ts'
import { contactMessage } from '../../src/api/validation.ts'

const admin: User = { name: 'director@example.org', role: 'admin' }
const editor: User = { name: 'asha@example.org', role: 'editor' }
const BODY = { slug: 'open-day', title: 'Open day', fields: { date: '2026-10-01' } }

function api() {
  const store = new MemoryStore()
  const files = new MemoryFiles()
  const router = new Router({
    contents: new ContentService(store),
    media: new MediaService(store, files, new OriginalSizeProcessor()),
    publishing: new PublishService(store, files),
  })
  const call = async (user: User, method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const init: RequestInit = { method, headers: { 'content-type': 'application/json', ...headers } }
    if (body !== undefined) init.body = body instanceof Uint8Array ? body : JSON.stringify(body)
    const response = await router.handle(new Request(`https://hai-admin.example.workers.dev/api${path}`, init), user)
    const text = await response.text()
    return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : undefined }
  }
  return { store, files, call }
}

describe('Content API', () => {
  it('editors list content by the contract type name', async () => {
    const { call } = api()
    await call(editor, 'POST', '/content/page-section', { ...BODY, fields: {} })
    const list = await call(editor, 'GET', '/content/page-section')
    expect(list.status).toBe(200)
    expect(list.body.items).toHaveLength(1)
    expect(list.body.items[0]).toMatchObject({ type: 'page-section', status: 'draft', version: 1, updatedBy: 'asha@example.org' })
    expect(list.body.items[0]).not.toHaveProperty('publishedVersion')
  })

  it('pages through long lists', async () => {
    const { call } = api()
    for (const n of [1, 2, 3]) await call(editor, 'POST', '/content/news', { ...BODY, slug: `n-${n}` })
    const first = await call(editor, 'GET', '/content/news?limit=2')
    expect(first.body).toMatchObject({ nextCursor: '2' })
    expect((await call(editor, 'GET', '/content/news?limit=2&cursor=2')).body.items).toHaveLength(1)
    expect((await call(editor, 'GET', '/content/news?limit=500')).status).toBe(400)
  })

  it('saving without a version is rejected', async () => {
    const { call } = api()
    const created = await call(editor, 'POST', '/content/news', BODY)
    const response = await call(editor, 'PUT', `/content/news/${created.body.id}`, BODY)
    expect(response).toMatchObject({ status: 428, body: { code: 'PRECONDITION_REQUIRED', title: 'Precondition Required' } })
  })

  it('a stale save returns a conflict', async () => {
    const { call } = api()
    const created = await call(editor, 'POST', '/content/news', BODY)
    await call(editor, 'PUT', `/content/news/${created.body.id}`, BODY, { 'If-Match': '1' })
    const stale = await call(admin, 'PUT', `/content/news/${created.body.id}`, BODY, { 'If-Match': '1' })
    expect(stale).toMatchObject({ status: 409, body: { code: 'VERSION_CONFLICT', type: 'https://humanai.cse.mrt.ac.lk/problems/version-conflict' } })
    expect(stale.headers.get('content-type')).toBe('application/problem+json')
  })

  it('invalid input lists every problem', async () => {
    const { call } = api()
    const response = await call(editor, 'POST', '/content/news', { slug: 'Not A Slug', title: '' })
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({ code: 'VALIDATION_FAILED' })
    expect(response.body.errors.map((e: { field: string }) => e.field)).toEqual(['slug', 'title'])
    expect((await call(editor, 'POST', '/content/news', '{not json')).body.code).toBe('MALFORMED_REQUEST')
  })

  it('editors cannot publish, roll back, hide or delete', async () => {
    const { call } = api()
    const created = await call(editor, 'POST', '/content/news', BODY)
    for (const [method, path] of [['POST', '/publish'], ['GET', '/releases'], ['POST', '/releases/x/restore'],
      ['POST', `/content/news/${created.body.id}/unpublish`], ['DELETE', `/content/news/${created.body.id}`]]) {
      const response = await call(editor, method, path, method === 'POST' ? {} : undefined)
      expect(response, `${method} ${path}`).toMatchObject({ status: 403, body: { code: 'FORBIDDEN' } })
    }
  })

  it('admins publish, and the release list shows which one is live', async () => {
    const { call, files } = api()
    await call(editor, 'POST', '/content/news', BODY)
    const published = await call(admin, 'POST', '/publish', { note: 'Launch' })
    expect(published).toMatchObject({ status: 201, body: { publishedBy: 'director@example.org', note: 'Launch', isCurrent: true } })
    expect(files.json('content/current.json')).toMatchObject({ release: published.body.id })
    const releases = await call(admin, 'GET', '/releases')
    expect(releases.body.items).toEqual([expect.objectContaining({ id: published.body.id, isCurrent: true })])
  })

  it('publishing invalid content explains what to fix', async () => {
    const { call } = api()
    await call(editor, 'POST', '/content/news', { ...BODY, fields: {} })
    const response = await call(admin, 'POST', '/publish', {})
    expect(response).toMatchObject({ status: 422, body: { code: 'VALIDATION_FAILED', errors: [{ field: expect.stringMatching(/^news\/n_\w+\.date$/) }] } })
  })

  it('unknown content types and routes are not found', async () => {
    const { call } = api()
    expect(await call(editor, 'GET', '/content/recipes')).toMatchObject({ status: 404, body: { detail: 'There is no such content type.' } })
    expect((await call(editor, 'GET', '/users')).status).toBe(404)
    expect((await call(editor, 'PATCH', '/publish', {})).status).toBe(405)
  })

  it('reports the signed-in user', async () => {
    expect((await api().call(editor, 'GET', '/session')).body).toEqual({ name: 'asha@example.org', role: 'editor' })
  })

  it('uploads a photo the way the dashboard does', async () => {
    const { call, files } = api()
    const photo = new Uint8Array(readFileSync(new URL('../../../apps/web/public/humanailogo.jpeg', import.meta.url)))
    const ticket = await call(editor, 'POST', '/media/uploads', { fileName: 'logo.jpg', contentType: 'image/jpeg', sizeBytes: photo.length })
    expect(ticket).toMatchObject({ status: 201, body: { partSizeBytes: photo.length, parts: [{ partNumber: 1, url: `/api/media/${ticket.body.mediaId}/upload` }] } })
    const put = await call(editor, 'PUT', ticket.body.parts[0].url.replace('/api', ''), photo, { 'content-type': 'image/jpeg' })
    expect(put.status).toBe(200)
    const done = await call(editor, 'POST', `/media/${ticket.body.mediaId}/complete`, { uploadId: ticket.body.uploadId, parts: [{ partNumber: 1, etag: put.headers.get('etag') }] })
    expect(done.body).toMatchObject({ status: 'ready', width: 1320, height: 768, src: `/media/${ticket.body.mediaId}/1320.jpg`, thumbnailSrc: `/media/${ticket.body.mediaId}/1320.jpg` })
    expect(done.body.renditions[0]).toMatchObject({ key: done.body.src, format: 'jpg', role: 'srcset' })
    expect(files.files.get(`media/${ticket.body.mediaId}/1320.jpg`)?.contentType).toBe('image/jpeg')
    expect((await call(editor, 'PATCH', `/media/${ticket.body.mediaId}`, { altText: '' })).status).toBe(400)
    expect((await call(editor, 'DELETE', `/media/${ticket.body.mediaId}`)).status).toBe(403)
    expect((await call(admin, 'DELETE', `/media/${ticket.body.mediaId}`)).status).toBe(204)
  })
})

describe('contact form input', () => {
  it('accepts a complete message', () => {
    expect(contactMessage({ name: 'Asha', email: 'asha@example.com', message: 'Hello' })).toMatchObject({ name: 'Asha' })
  })

  it('reports each invalid field (ported from ApiSecurityTest)', () => {
    expect(() => contactMessage({ name: 'Asha', email: 'not-an-email', message: '' })).toThrowError(expect.objectContaining({
      status: 400, code: 'VALIDATION_FAILED', errors: [expect.objectContaining({ field: 'email' }), expect.objectContaining({ field: 'message' })],
    }))
  })
})
