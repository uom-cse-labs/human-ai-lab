/**
 * Serves the public files the Content API writes to R2: published releases under /content and photos under
 * /media. Everything else in the bucket (drafts, media records, release history) is never served.
 */

/** The bucket key for a public URL path, or undefined if the path isn't public. */
export function publicKey(pathname: string): string | undefined {
  let key: string
  try {
    key = decodeURIComponent(pathname).replace(/^\/+/, '')
  } catch {
    return undefined
  }
  if (!/^(content|media)\/./.test(key) || key.split('/').some((part) => part === '..' || part === '.' || part === '')) {
    return undefined
  }
  return key
}

/**
 * current.json is re-checked on every load so a publish shows up at once; release folders never change once
 * written; photos are replaced only if reprocessed.
 */
export function cacheControl(key: string): string {
  if (key === 'content/current.json') {
    return 'no-cache'
  }
  if (key.startsWith('content/releases/')) {
    return 'public, max-age=31536000, immutable'
  }
  return 'public, max-age=86400'
}

const TYPES: Record<string, string> = {
  json: 'application/json',
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export function contentType(key: string): string {
  return TYPES[key.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream'
}

export async function serveFromR2(bucket: R2Bucket, request: Request): Promise<Response> {
  const key = publicKey(new URL(request.url).pathname)
  if (!key) {
    return new Response('Not found', { status: 404 })
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
  }
  const object = await bucket.get(key, { onlyIf: request.headers })
  if (!object) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } })
  }
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  if (!headers.has('content-type')) {
    headers.set('content-type', contentType(key))
  }
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', cacheControl(key))
  headers.set('x-content-type-options', 'nosniff')
  if (!('body' in object)) {
    return new Response(null, { status: 304, headers }) // If-None-Match matched
  }
  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

/**
 * Serves /content/current.json. On a brand-new deployment nothing is published yet, so the store imports
 * the website's built-in content first.
 */
export async function currentRelease(request: Request, bucket: R2Bucket, ensureContent: () => Promise<boolean>): Promise<Response> {
  const response = await serveFromR2(bucket, request)
  if (response.status !== 404) {
    return response
  }
  return (await ensureContent()) ? serveFromR2(bucket, request) : response
}
