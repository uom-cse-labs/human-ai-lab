// Bundles the website's built-in content (apps/web/src) into the dashboard Worker as src/seed.gen.json.
// A new deployment imports it once and publishes it (src/api/seed.ts). Runs before every build, dev run,
// type check and test, so it always matches the website's files.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const site = new URL('../../apps/web/src/', import.meta.url)
const read = (path) => readFileSync(new URL(path, site), 'utf8')
const newsDir = new URL('content/news/', site)

const bundle = {
  news: Object.fromEntries(readdirSync(newsDir).filter((f) => f.endsWith('.md')).sort().map((f) => [f, read(`content/news/${f}`)])),
  publications: JSON.parse(read('content/publications.json')),
  themes: JSON.parse(read('content/themes.json')),
  people: JSON.parse(read('data.json')),
}
writeFileSync(new URL('../src/seed.gen.json', import.meta.url), `${JSON.stringify(bundle, null, 2)}\n`)
