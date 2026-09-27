/**
 * Turns an uploaded original into safe, web-sized images (Java: JavaImageProcessor). Resizing runs on
 * Cloudflare Images (the IMAGES binding), since a Worker has too little CPU time to resize photos itself.
 * Everything here that touches bytes only reads headers or copies segments, so it stays cheap.
 *
 * Every output has its camera and location data removed twice over: Cloudflare Images keeps only the
 * copyright tag by default, and stripMetadata() then drops every metadata block that remains.
 */

/** Widths offered to the website; a photo is never enlarged. */
export const WIDTHS = [480, 960, 1600]
/** Guards against "decompression bombs": small files that decode into enormous images. */
export const MAX_PIXELS = 50_000_000

export type ImageFormat = 'jpg' | 'png' | 'webp'

export interface Output {
  fileName: string
  data: Uint8Array
  contentType: string
  format: ImageFormat
  width: number
}

export interface ProcessedImage {
  width: number
  height: number
  sizes: Output[]
}

export interface ImageProcessor {
  /** @throws RejectedFile if the file isn't a supported image */
  process(original: Uint8Array): Promise<ProcessedImage>
}

export class RejectedFile extends Error {}

const CONTENT_TYPES: Record<ImageFormat, 'image/jpeg' | 'image/png' | 'image/webp'> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/** Resizes with Cloudflare Images. */
export class CloudflareImageProcessor implements ImageProcessor {
  constructor(private readonly images: ImagesBinding) {}

  async process(original: Uint8Array): Promise<ProcessedImage> {
    // Phone photos stored sideways carry an EXIF note to turn them; Cloudflare Images applies it ("EXIF
    // rotation is applied even if the metadata is discarded"). `width` is the width after turning.
    // The local development engine only resizes, so there such photos stay sideways.
    const { format, width, height } = inspect(original)
    const sizes: Output[] = []
    for (const target of targetWidths(width)) {
      let data: Uint8Array
      try {
        const result = await this.images
          .input(stream(original))
          .transform({ width: target, fit: 'scale-down' })
          .output({ format: CONTENT_TYPES[format], quality: 85 })
        data = new Uint8Array(await new Response(result.image()).arrayBuffer())
      } catch (e) {
        console.error('Cloudflare Images could not process an upload', e)
        // 9422: the free plan's 5,000 transformations for the month are used up.
        if ((e as { code?: number }).code === 9422) {
          throw new RejectedFile("This month's free photo processing allowance is used up. An admin can press Retry next month.")
        }
        throw new RejectedFile('This image is damaged or incomplete. Try exporting it again.')
      }
      sizes.push({ fileName: `${target}.${format}`, data: stripMetadata(data, format), contentType: CONTENT_TYPES[format], format, width: target })
    }
    return { width, height, sizes }
  }
}

/**
 * Without Cloudflare Images (local development): keeps the original size, with metadata removed. Photos
 * still work in the dashboard and on the site, just without the smaller sizes.
 */
export class OriginalSizeProcessor implements ImageProcessor {
  async process(original: Uint8Array): Promise<ProcessedImage> {
    const { format, width, height } = inspect(original)
    return {
      width,
      height,
      sizes: [{ fileName: `${width}.${format}`, data: stripMetadata(original, format), contentType: CONTENT_TYPES[format], format, width }],
    }
  }
}

/** The real type and upright size of an image, or RejectedFile. */
export function inspect(bytes: Uint8Array): { format: ImageFormat; width: number; height: number } {
  const format = sniff(bytes)
  if (!format) {
    throw new RejectedFile("This file isn't a JPEG, PNG or WebP image, whatever its name says.")
  }
  const size = imageSize(bytes, format)
  if (!size) {
    throw new RejectedFile('This image is damaged or incomplete. Try exporting it again.')
  }
  if (size.width * size.height > MAX_PIXELS) {
    throw new RejectedFile('This image is too large in pixels. Resize it below 50 megapixels.')
  }
  // Phone photos are often stored sideways with an EXIF note to turn them; Cloudflare Images turns them.
  const turned = format === 'jpg' && exifOrientation(bytes) >= 5
  return { format, width: turned ? size.height : size.width, height: turned ? size.width : size.height }
}

export function targetWidths(originalWidth: number): number[] {
  const widths = WIDTHS.filter((w) => w < originalWidth)
  widths.push(Math.min(originalWidth, WIDTHS[WIDTHS.length - 1]))
  return [...new Set(widths)]
}

export function sniff(b: Uint8Array): ImageFormat | undefined {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'jpg'
  }
  if (b.length > 8 && b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') {
    return 'png'
  }
  if (b.length > 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') {
    return 'webp'
  }
  return undefined
}

/** Stored pixel size from the file headers (before any EXIF turn). */
export function imageSize(b: Uint8Array, format: ImageFormat): { width: number; height: number } | undefined {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  try {
    if (format === 'png') {
      return ascii(b, 12, 4) === 'IHDR' ? { width: view.getUint32(16), height: view.getUint32(20) } : undefined
    }
    if (format === 'webp') {
      switch (ascii(b, 12, 4)) {
        case 'VP8X':
          return { width: 1 + (view.getUint32(24, true) & 0xffffff), height: 1 + (view.getUint32(27, true) & 0xffffff) }
        case 'VP8 ':
          return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
        case 'VP8L': {
          const bits = view.getUint32(21, true)
          return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
        }
        default:
          return undefined
      }
    }
    // JPEG: the first start-of-frame marker holds the size.
    let i = 2
    while (i + 9 < b.length && b[i] === 0xff) {
      const marker = b[i + 1]
      const length = view.getUint16(i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const size = { width: view.getUint16(i + 7), height: view.getUint16(i + 5) }
        return size.width && size.height ? size : undefined
      }
      if (marker === 0xda) {
        return undefined
      }
      i += 2 + length
    }
    return undefined
  } catch {
    return undefined // truncated header
  }
}

/** The EXIF orientation (1–8) of a JPEG, or 1 if absent or unreadable. */
export function exifOrientation(b: Uint8Array): number {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  try {
    let i = 2
    while (i + 4 < b.length && b[i] === 0xff) {
      const marker = b[i + 1]
      const length = view.getUint16(i + 2)
      if (marker === 0xe1 && ascii(b, i + 4, 4) === 'Exif') {
        const tiff = i + 10
        const little = b[tiff] === 0x49 // "II"
        const ifd = tiff + view.getUint32(tiff + 4, little)
        const entries = view.getUint16(ifd, little)
        for (let e = 0; e < entries; e++) {
          const entry = ifd + 2 + e * 12
          if (view.getUint16(entry, little) === 0x0112) {
            const value = view.getUint16(entry + 8, little)
            return value >= 1 && value <= 8 ? value : 1
          }
        }
        return 1
      }
      if (marker === 0xda) {
        break
      }
      i += 2 + length
    }
  } catch {
    // Malformed EXIF: treat as upright.
  }
  return 1
}

/** Removes EXIF, XMP, IPTC, comments and text chunks. Colour profiles are kept so colours stay right. */
export function stripMetadata(b: Uint8Array, format: ImageFormat): Uint8Array {
  if (format === 'jpg') {
    return stripJpeg(b)
  }
  if (format === 'png') {
    return stripPng(b)
  }
  return stripWebp(b)
}

function stripJpeg(b: Uint8Array): Uint8Array {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const parts: Uint8Array[] = [b.subarray(0, 2)]
  let i = 2
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1]
    if (marker === 0xda) {
      break // start of scan: the rest is image data
    }
    const end = i + 2 + view.getUint16(i + 2)
    // APP1 (EXIF, XMP), APP13 (IPTC) and COM (comments) carry metadata; APP2 (ICC) and APP14 (Adobe) matter for colour.
    const metadata = marker === 0xe1 || marker === 0xed || marker === 0xfe
    if (!metadata) {
      parts.push(b.subarray(i, end))
    }
    i = end
  }
  parts.push(b.subarray(i))
  return concat(parts)
}

function stripPng(b: Uint8Array): Uint8Array {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const dropped = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME'])
  const parts: Uint8Array[] = [b.subarray(0, 8)]
  let i = 8
  while (i + 12 <= b.length) {
    const end = i + 12 + view.getUint32(i)
    if (!dropped.has(ascii(b, i + 4, 4))) {
      parts.push(b.subarray(i, end))
    }
    i = end
  }
  return concat(parts)
}

function stripWebp(b: Uint8Array): Uint8Array {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const parts: Uint8Array[] = []
  let i = 12
  while (i + 8 <= b.length) {
    const size = view.getUint32(i + 4, true)
    const end = Math.min(b.length, i + 8 + size + (size % 2))
    const chunk = ascii(b, i, 4)
    if (chunk === 'VP8X') {
      const copy = b.slice(i, end)
      copy[8] &= ~0x0c // clear the EXIF (0x08) and XMP (0x04) flags
      parts.push(copy)
    } else if (chunk !== 'EXIF' && chunk !== 'XMP ') {
      parts.push(b.subarray(i, end))
    }
    i = end
  }
  const body = concat(parts)
  const out = new Uint8Array(12 + body.length)
  out.set(b.subarray(0, 12))
  new DataView(out.buffer).setUint32(4, 4 + body.length, true)
  out.set(body, 12)
  return out
}

function ascii(b: Uint8Array, at: number, length: number): string {
  return String.fromCharCode(...b.subarray(at, at + length))
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out
}

function stream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new Response(bytes).body as ReadableStream<Uint8Array>
}
