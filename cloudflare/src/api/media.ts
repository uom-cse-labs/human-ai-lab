/**
 * The media library (Java: MediaService): upload photos once, describe them, use them anywhere. The browser
 * uploads the original to the API, which keeps it in R2 under uploads/ so it can be processed again.
 */
import { ApiError, notFound } from './errors.ts'
import { type ImageProcessor, RejectedFile } from './images.ts'
import { CONTENT_TYPES, type MediaAsset, page, type Rendition, shortId } from './model.ts'
import type { Files, Store } from './store.ts'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const UPLOAD_MINUTES = 15

export interface UploadTarget {
  url: string
  uploadId: string
  expiresAt: string
}

/** A place a media asset is used. */
export interface Usage {
  kind: 'content'
  ref: string
  title: string
}

export class MediaService {
  constructor(
    private readonly store: Store,
    private readonly files: Files,
    private readonly processor: ImageProcessor,
    private readonly now: () => Date = () => new Date(),
  ) {}

  startUpload(fileName: string, contentType: string, sizeBytes: number, user: string): { asset: MediaAsset; target: UploadTarget } {
    if (contentType.startsWith('video/')) {
      throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE',
        "Video uploads aren't available yet. For now, upload videos to YouTube and link to them.")
    }
    if (!IMAGE_TYPES.includes(contentType)) {
      throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE',
        "This file type can't be uploaded. Use a JPEG, PNG or WebP photo (iPhone photos: export as JPEG).")
    }
    if (sizeBytes > MAX_IMAGE_BYTES) {
      throw new ApiError(413, 'FILE_TOO_LARGE',
        `This photo is ${(sizeBytes / 1_048_576).toFixed(1)} MB. The limit is 25 MB; export a smaller version and try again.`)
    }
    const now = this.now()
    const asset: MediaAsset = {
      id: `m_${shortId()}`,
      kind: 'image',
      status: 'uploading',
      fileName,
      contentType,
      sizeBytes,
      renditions: [],
      uploadedBy: user,
      createdAt: now.toISOString(),
    }
    this.store.saveMedia(asset)
    return {
      asset,
      target: {
        url: `/api/media/${asset.id}/upload`,
        uploadId: `upload-${asset.id}`,
        expiresAt: new Date(now.getTime() + UPLOAD_MINUTES * 60_000).toISOString(),
      },
    }
  }

  /** Stores the uploaded original, refusing more than the size announced when the upload started. */
  async receiveUpload(id: string, body: ReadableStream<Uint8Array> | null): Promise<void> {
    const asset = this.get(id)
    if (asset.status !== 'uploading') {
      throw new ApiError(409, 'INVALID_STATE', 'This upload has already been completed.')
    }
    const data = await readAtMost(body, asset.sizeBytes)
    await this.files.put(originalKey(id), data, asset.contentType)
  }

  /** The browser finished uploading: process now. */
  async completeUpload(id: string): Promise<MediaAsset> {
    const asset = this.get(id)
    if (asset.status !== 'uploading') {
      return asset
    }
    const original = await this.files.get(originalKey(id))
    if (!original) {
      throw new ApiError(409, 'UPLOAD_MISSING', "The file didn't arrive. Upload it again.")
    }
    return this.process({ ...asset, status: 'processing' }, original)
  }

  /** Admins can re-run processing of a failed upload from the kept original. */
  async retry(id: string): Promise<MediaAsset> {
    const asset = this.get(id)
    if (asset.status !== 'failed') {
      return asset
    }
    const original = await this.files.get(originalKey(id))
    if (!original) {
      throw new ApiError(409, 'UPLOAD_MISSING', "The original file is gone. Upload it again.")
    }
    return this.process({ ...asset, status: 'processing', failureReason: undefined }, original)
  }

  private async process(asset: MediaAsset, original: Uint8Array): Promise<MediaAsset> {
    this.store.saveMedia(asset)
    try {
      const image = await this.processor.process(original)
      const renditions: Rendition[] = []
      for (const size of image.sizes) {
        await this.files.put(`media/${asset.id}/${size.fileName}`, size.data, size.contentType)
        renditions.push({ src: `/media/${asset.id}/${size.fileName}`, format: size.format, role: 'srcset', width: size.width, bytes: size.data.length })
      }
      const ready: MediaAsset = { ...this.get(asset.id), status: 'ready', failureReason: undefined, width: image.width, height: image.height, renditions }
      this.store.saveMedia(ready)
      return ready
    } catch (e) {
      if (!(e instanceof RejectedFile)) {
        throw e
      }
      const failed: MediaAsset = { ...this.get(asset.id), status: 'failed', failureReason: e.message }
      this.store.saveMedia(failed)
      return failed
    }
  }

  describe(id: string, altText: string | undefined, caption: string | undefined): MediaAsset {
    const asset = this.get(id)
    const described: MediaAsset = {
      ...asset,
      altText: altText === undefined ? asset.altText : altText.trim(),
      caption: caption === undefined ? asset.caption : caption.trim(),
    }
    this.store.saveMedia(described)
    return described
  }

  get(id: string): MediaAsset {
    const asset = this.store.getMedia(id)
    if (!asset) {
      throw notFound(`media ${id}`)
    }
    return asset
  }

  list(cursor: string | undefined, limit: number) {
    return page(this.store.listMedia(), cursor, limit)
  }

  /** Content items that reference the asset, whether drafts or published. */
  usage(id: string): Usage[] {
    return CONTENT_TYPES.flatMap((type) => this.store.listItems(type)
      .filter((item) => item.mediaRefs.includes(id))
      .map((item): Usage => ({ kind: 'content', ref: `${type}/${item.id}`, title: item.title })))
  }

  /** Deletes an unused asset and its files. Admins only. */
  async delete(id: string): Promise<void> {
    this.get(id)
    const usage = this.usage(id)
    if (usage.length) {
      throw new ApiError(409, 'MEDIA_IN_USE',
        `This photo is used by ${usage.length} item(s), e.g. "${usage[0].title}". Remove it from them first.`)
    }
    await this.files.deletePrefix(`media/${id}/`)
    await this.files.deletePrefix(`uploads/${id}/`)
    this.store.deleteMedia(id)
  }
}

/** The public URL of the largest rendition: what the website shows. */
export function src(asset: MediaAsset): string | undefined {
  return [...asset.renditions].sort((a, b) => b.width - a.width)[0]?.src
}

/** The smallest rendition: for the dashboard's library grid. */
export function thumbnailSrc(asset: MediaAsset): string | undefined {
  return [...asset.renditions].sort((a, b) => a.width - b.width)[0]?.src
}

function originalKey(id: string): string {
  return `uploads/${id}/original`
}

async function readAtMost(body: ReadableStream<Uint8Array> | null, maxBytes: number): Promise<Uint8Array> {
  if (!body) {
    throw new ApiError(400, 'VALIDATION_FAILED', 'The upload is empty.')
  }
  const chunks: Uint8Array[] = []
  let total = 0
  const reader = body.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    total += value.length
    if (total > maxBytes) {
      await reader.cancel()
      throw new ApiError(400, 'VALIDATION_FAILED', 'The file is larger than announced when the upload started.')
    }
    chunks.push(value)
  }
  const data = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    data.set(chunk, at)
    at += chunk.length
  }
  return data
}
