import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { exifOrientation, imageSize, inspect, OriginalSizeProcessor, RejectedFile, sniff, stripMetadata, targetWidths } from '../../src/api/images.ts'

const publicFile = (name: string) => new Uint8Array(readFileSync(new URL(`../../../apps/web/public/${name}`, import.meta.url)))
const jpeg = publicFile('humanailogo.jpeg')
const png = publicFile('uom_logo.png')
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

/** A JPEG header with an EXIF block (orientation 6, and a fake GPS string) and a comment, before the real image data. */
function withExif(orientation: number): Uint8Array {
  const tiff = [...ascii('MM'), 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0, ...ascii('GPS 6.79N 79.90E')]
  const app1 = [...ascii('Exif'), 0, 0, ...tiff]
  const comment = ascii('camera: Pixel 9')
  const segment = (marker: number, body: number[]) => [0xff, marker, (body.length + 2) >> 8, (body.length + 2) & 0xff, ...body]
  return new Uint8Array([0xff, 0xd8, ...segment(0xe1, app1), ...segment(0xfe, comment), ...jpeg.subarray(2)])
}

const contains = (bytes: Uint8Array, text: string) => Buffer.from(bytes).includes(Buffer.from(text))

describe('image handling (ported from JavaImageProcessorTest)', () => {
  it('knows the real type from the contents, whatever the name says', () => {
    expect(sniff(jpeg)).toBe('jpg')
    expect(sniff(png)).toBe('png')
    expect(sniff(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeUndefined()
    expect(() => inspect(new TextEncoder().encode('%PDF-1.7 not an image'))).toThrow(RejectedFile)
  })

  it('reads sizes from the headers', () => {
    expect(imageSize(jpeg, 'jpg')).toEqual({ width: 1320, height: 768 })
    expect(imageSize(png, 'png')).toMatchObject({ width: expect.any(Number), height: expect.any(Number) })
  })

  it('rejects truncated images', () => {
    expect(() => inspect(jpeg.subarray(0, 40))).toThrow(/damaged or incomplete/)
  })

  it('makes web sizes without enlarging', () => {
    expect(targetWidths(4000)).toEqual([480, 960, 1600])
    expect(targetWidths(1320)).toEqual([480, 960, 1320])
    expect(targetWidths(300)).toEqual([300])
  })

  it('knows phone photos stored sideways are portrait', () => {
    const sideways = withExif(6)
    expect(exifOrientation(sideways)).toBe(6)
    expect(exifOrientation(jpeg)).toBe(1)
    expect(inspect(sideways)).toEqual({ format: 'jpg', width: 768, height: 1320 })
  })

  it('removes camera and location data but keeps the image', () => {
    const photo = withExif(6)
    expect(contains(photo, 'GPS 6.79N')).toBe(true)
    const clean = stripMetadata(photo, 'jpg')
    expect(contains(clean, 'GPS 6.79N')).toBe(false)
    expect(contains(clean, 'Pixel 9')).toBe(false)
    expect(Buffer.from(clean).equals(Buffer.from(stripMetadata(jpeg, 'jpg')))).toBe(true)
    expect(imageSize(clean, 'jpg')).toEqual({ width: 1320, height: 768 })
  })

  it('removes text chunks from PNGs', () => {
    const text = [...ascii('tEXt'), ...ascii('Author\0Somebody')]
    const chunk = new Uint8Array([0, 0, 0, text.length - 4, ...text, 0, 0, 0, 0])
    const tagged = new Uint8Array([...png.subarray(0, 33), ...chunk, ...png.subarray(33)])
    expect(contains(tagged, 'Somebody')).toBe(true)
    const clean = stripMetadata(tagged, 'png')
    expect(contains(clean, 'Somebody')).toBe(false)
    expect(clean.length).toBe(stripMetadata(png, 'png').length)
  })

  it('keeps the original size when Cloudflare Images is not available', async () => {
    const result = await new OriginalSizeProcessor().process(withExif(1))
    expect(result).toMatchObject({ width: 1320, height: 768, sizes: [{ fileName: '1320.jpg', format: 'jpg', contentType: 'image/jpeg', width: 1320 }] })
    expect(contains(result.sizes[0].data, 'GPS')).toBe(false)
  })
})
