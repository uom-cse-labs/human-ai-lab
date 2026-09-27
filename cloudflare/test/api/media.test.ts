import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ContentService } from '../../src/api/content.ts'
import { type ImageProcessor, OriginalSizeProcessor, RejectedFile } from '../../src/api/images.ts'
import { MediaService } from '../../src/api/media.ts'
import { MemoryFiles, MemoryStore } from '../../src/api/store.ts'

const jpeg = new Uint8Array(readFileSync(new URL('../../../apps/web/public/humanailogo.jpeg', import.meta.url)))
const body = (bytes: Uint8Array) => new Response(bytes).body

/** Stands in for Cloudflare Images: three sizes, each a copy of the input. */
const threeSizes: ImageProcessor = {
  async process(original) {
    return {
      width: 2000,
      height: 1000,
      sizes: [480, 960, 1600].map((width) => ({ fileName: `${width}.jpg`, data: original.subarray(0, width), contentType: 'image/jpeg', format: 'jpg' as const, width })),
    }
  },
}

function setup(processor: ImageProcessor = threeSizes) {
  const store = new MemoryStore()
  const files = new MemoryFiles()
  return { store, files, contents: new ContentService(store), media: new MediaService(store, files, processor) }
}

async function upload(media: MediaService, bytes = jpeg) {
  const { asset } = media.startUpload('photo.jpg', 'image/jpeg', bytes.length, 'asha')
  await media.receiveUpload(asset.id, body(bytes))
  return media.completeUpload(asset.id)
}

describe('MediaService (ported from MediaServiceTest)', () => {
  it('uploaded photos become ready with web sizes', async () => {
    const { files, media } = setup()
    const asset = await upload(media)
    expect(asset).toMatchObject({ status: 'ready', width: 2000, height: 1000 })
    expect(asset.renditions.map((r) => r.src)).toEqual([480, 960, 1600].map((w) => `/media/${asset.id}/${w}.jpg`))
    expect(files.files.has(`media/${asset.id}/1600.jpg`)).toBe(true)
    expect(files.files.has(`uploads/${asset.id}/original`)).toBe(true)
  })

  it('rejects videos, unsupported types and oversized files', () => {
    const { media } = setup()
    expect(() => media.startUpload('clip.mp4', 'video/mp4', 10, 'asha')).toThrowError(expect.objectContaining({ status: 415, message: expect.stringContaining('YouTube') }))
    expect(() => media.startUpload('photo.heic', 'image/heic', 10, 'asha')).toThrowError(expect.objectContaining({ status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' }))
    expect(() => media.startUpload('huge.jpg', 'image/jpeg', 30 * 1024 * 1024, 'asha')).toThrowError(expect.objectContaining({ status: 413, message: expect.stringContaining('30.0 MB') }))
  })

  it('refuses a file larger than announced', async () => {
    const { media } = setup()
    const { asset } = media.startUpload('photo.jpg', 'image/jpeg', 100, 'asha')
    await expect(media.receiveUpload(asset.id, body(jpeg))).rejects.toMatchObject({ status: 400 })
  })

  it('completing without a file is refused', async () => {
    const { media } = setup()
    const { asset } = media.startUpload('photo.jpg', 'image/jpeg', 100, 'asha')
    await expect(media.completeUpload(asset.id)).rejects.toMatchObject({ code: 'UPLOAD_MISSING' })
  })

  it('bad files fail with a reason and can be retried', async () => {
    let reject = true
    const flaky: ImageProcessor = {
      async process(original) {
        if (reject) throw new RejectedFile('This image is damaged or incomplete. Try exporting it again.')
        return threeSizes.process(original)
      },
    }
    const { media } = setup(flaky)
    const failed = await upload(media)
    expect(failed).toMatchObject({ status: 'failed', failureReason: expect.stringContaining('damaged') })
    reject = false
    expect(await media.retry(failed.id)).toMatchObject({ status: 'ready' })
  })

  it('photos in use cannot be deleted', async () => {
    const { contents, media } = setup()
    const asset = await upload(media)
    contents.create('news', { slug: 'a', title: 'Open day', fields: {}, mediaRefs: [asset.id] }, 'asha')
    expect(media.usage(asset.id)).toEqual([{ kind: 'content', ref: expect.stringMatching(/^news\/n_/), title: 'Open day' }])
    await expect(media.delete(asset.id)).rejects.toMatchObject({ code: 'MEDIA_IN_USE', message: expect.stringContaining('"Open day"') })
  })

  it('unused photos are deleted with their files', async () => {
    const { files, media } = setup()
    const asset = await upload(media)
    await media.delete(asset.id)
    expect([...files.files.keys()].filter((k) => k.includes(asset.id))).toEqual([])
    expect(() => media.get(asset.id)).toThrowError(expect.objectContaining({ status: 404 }))
  })

  it('alt text is stored trimmed', async () => {
    const { media } = setup()
    const asset = await upload(media)
    expect(media.describe(asset.id, '  Students at the open day  ', undefined).altText).toBe('Students at the open day')
  })

  it('works end to end with the original-size processor', async () => {
    const { media } = setup(new OriginalSizeProcessor())
    expect(await upload(media)).toMatchObject({ status: 'ready', width: 1320, height: 768, renditions: [{ width: 1320, format: 'jpg' }] })
  })
})
