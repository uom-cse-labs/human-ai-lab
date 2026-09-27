import { describe, expect, it } from 'vitest'
import { cacheControl, contentType, publicKey } from '../src/r2.ts'

describe('publicKey', () => {
  it('serves published releases and photos', () => {
    expect(publicKey('/content/current.json')).toBe('content/current.json')
    expect(publicKey('/content/releases/2026-10-02T09-15-00Z/news.json')).toBe('content/releases/2026-10-02T09-15-00Z/news.json')
    expect(publicKey('/media/m_1/960.jpg')).toBe('media/m_1/960.jpg')
  })

  it('never serves drafts, media records or the release history', () => {
    for (const path of ['/items/news/n_1.json', '/media-records/m_1.json', '/releases.json', '/content/', '/media/',
      '/content/%2e%2e/items/news/n_1.json', '/media/../items/x.json', '/content//x.json', '/content/%E0%A4%A']) {
      expect(publicKey(path), path).toBeUndefined()
    }
  })
})

describe('cacheControl', () => {
  it('re-checks the pointer on every load and caches releases for good', () => {
    expect(cacheControl('content/current.json')).toBe('no-cache')
    expect(cacheControl('content/releases/r/news.json')).toContain('immutable')
    expect(cacheControl('media/m_1/960.jpg')).toBe('public, max-age=86400')
  })
})

describe('contentType', () => {
  it('falls back on the file extension', () => {
    expect(contentType('content/current.json')).toBe('application/json')
    expect(contentType('media/m_1/960.webp')).toBe('image/webp')
    expect(contentType('media/m_1/x.bin')).toBe('application/octet-stream')
  })
})
