// Generates the SVG diagrams used by docs/architecture/technical-design.md.
// Edit the data below, then run:  node docs/architecture/diagrams/technical-design/build.mjs
// File names follow the 4+1 views: logical-*, process-*, development-*, physical-*, scenarios-*.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))

// Light palette on an opaque card, so the images read on light and dark Markdown themes.
const C = {
  card: '#ffffff', cardLine: '#dfe2ec', text: '#0d0f2b', muted: '#525a7c', line: '#c7cbdc',
  store: '#e9ebf4', person: '#eef0f7', primary: '#151b54', path: '#0e7686', band: '#f3f4fa',
}
const SANS = "'DM Sans', 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function doc(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
  .n-comp{fill:${C.card};stroke:${C.line};stroke-width:1.2}
  .n-store{fill:${C.store};stroke:${C.line};stroke-width:1.2}
  .n-person{fill:${C.person};stroke:${C.line};stroke-width:1.2}
  .n-ext{fill:${C.card};stroke:${C.line};stroke-width:1.2;stroke-dasharray:5 4}
  .t-name{fill:${C.text};font:600 13.5px ${SANS}}
  .t-sub{fill:${C.muted};font:400 10.5px ${MONO}}
  .t-eye{fill:${C.muted};font:500 9.5px ${MONO};letter-spacing:.1em}
  .t-edge{fill:${C.muted};font:500 11px ${MONO}}
  .t-edge.path{fill:${C.path}}
  .t-bound{fill:${C.muted};font:500 11px ${MONO};letter-spacing:.08em}
  .t-title{fill:${C.primary};font:700 17px ${SANS}}
  .t-band{fill:${C.text};font:400 11.5px ${MONO}}
  .t-num{fill:${C.card};font:600 10px ${MONO}}
  .e{fill:none;stroke:${C.muted};stroke-width:1.4}
  .e.path{stroke:${C.path};stroke-width:2}
  .e.ret{stroke-dasharray:5 4}
  .life{stroke:${C.line};stroke-width:1.2;stroke-dasharray:4 5}
  .bound{fill:none;stroke:${C.primary};stroke-opacity:.45;stroke-width:1.3;stroke-dasharray:7 5}
  .band{fill:${C.band};stroke:${C.line};stroke-width:1;stroke-dasharray:4 4}
  .note{fill:#e3f3f5;stroke:${C.path};stroke-width:1}
  .ah{fill:${C.muted}} .ah.path{fill:${C.path}}
</style>
<defs>
  <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ah"/></marker>
  <marker id="ahp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ah path"/></marker>
  <marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M1 1 L11 6 L1 11 z" fill="${C.card}" stroke="${C.muted}" stroke-width="1.2"/></marker>
  <marker id="dia" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="16" markerHeight="10" orient="auto"><path d="M1 5 L8 1 L15 5 L8 9 z" fill="${C.muted}"/></marker>
  <marker id="oa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${C.muted}" stroke-width="1.4"/></marker>
</defs>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="20" fill="${C.card}" stroke="${C.cardLine}"/>
${body}
</svg>
`
}

const text = (cls, x, y, s, anchor = 'start') =>
  `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`

/* ------------------------------------------------------------------ */
/* 1 + 2. Component map and the same map on AWS (shared geometry)      */
/* ------------------------------------------------------------------ */

const OX = 20, OY = 64 // offset of the map inside the card (room for the title)
const N = {
  visitor: { x: 100, y: 20, w: 160, h: 44, k: 'person', a: ['Visitor'], b: ['Visitors'] },
  editor:  { x: 620, y: 20, w: 180, h: 44, k: 'person', a: ['Editor or admin'], b: ['Editors & admins'] },
  web:     { x: 60, y: 116, w: 240, h: 64, k: 'comp', a: ['Public website', 'apps/web'], b: ['PUBLIC WEBSITE', 'CloudFront + WAF', 'S3 web-public'] },
  inbox:   { x: 380, y: 116, w: 150, h: 64, k: 'ext', bk: 'comp', a: ['Lab inbox', 'email · outside AWS'], b: ['CONTACT DELIVERY', 'Amazon SES', 'to the lab inbox'] },
  admin:   { x: 600, y: 116, w: 220, h: 64, k: 'comp', a: ['Admin dashboard', 'apps/admin'], b: ['ADMIN DASHBOARD', 'CloudFront + WAF', 'S3 web-admin'] },
  idp:     { x: 890, y: 116, w: 130, h: 64, k: 'comp', a: ['Identity', 'invite-only · MFA'], b: ['IDENTITY', 'Cognito', 'user pool · MFA'] },
  contact: { x: 340, y: 250, w: 180, h: 64, k: 'comp', a: ['Contact service', 'content-api · Java'], b: ['CONTACT ENDPOINT', 'Lambda (same fn)', 'public route · WAF limit'] },
  api:     { x: 560, y: 250, w: 180, h: 64, k: 'comp', a: ['Content API', 'content-api · Java'], b: ['CONTENT API', 'ALB → Lambda', 'Java 21 · SnapStart'] },
  uploads: { x: 850, y: 250, w: 170, h: 64, k: 'store', a: ['Upload inbox', 'private, unprocessed'], b: ['UPLOAD INBOX', 'S3 uploads', 'presigned · private'] },
  media:   { x: 20, y: 410, w: 170, h: 64, k: 'store', a: ['Media library', 'photo & video renditions'], b: ['MEDIA LIBRARY', 'S3 media', '/media/* via CDN'] },
  snap:    { x: 210, y: 410, w: 180, h: 64, k: 'store', a: ['Published content', 'versioned JSON releases'], b: ['PUBLISHED CONTENT', 'S3 content', '/content/* via CDN'] },
  db:      { x: 560, y: 410, w: 180, h: 64, k: 'store', a: ['Content database', 'drafts · media · audit'], b: ['CONTENT DATABASE', 'DynamoDB', 'on-demand · PITR'] },
  proc:    { x: 850, y: 410, w: 170, h: 64, k: 'comp', a: ['Media processor', 'services/media'], b: ['MEDIA PROCESSOR', 'Lambda', '+ MediaConvert'] },
}
// pts: polyline, p: visitor path, a/b: label per view, l: [x, y, anchor]
const E = [
  { pts: [[180, 64], [180, 114]], p: 1, a: 'browses', b: 'HTTPS', l: [188, 94, 'start'] },
  { pts: [[110, 180], [110, 408]], p: 1, a: 'loads photos, video', b: '/media/*', l: [118, 262, 'start'] },
  { pts: [[250, 180], [280, 408]], p: 1, a: 'reads content', b: '/content/*', l: [290, 344, 'start'] },
  { pts: [[300, 168], [370, 248]], p: 0, a: 'sends message', b: '/api/contact', l: [340, 206, 'start'] },
  { pts: [[455, 250], [455, 182]], p: 0, a: 'emails', b: 'SendEmail', l: [462, 222, 'start'] },
  { pts: [[710, 64], [710, 114]], p: 0, a: 'manages content', b: 'HTTPS', l: [718, 94, 'start'] },
  { pts: [[820, 148], [888, 148]], p: 0, a: 'signs in', b: 'PKCE', l: [854, 140, 'middle'] },
  { pts: [[650, 180], [650, 248]], p: 0, a: 'edits, publishes', b: '/api/* + JWT', l: [642, 220, 'end'] },
  { pts: [[800, 180], [900, 248]], p: 0, a: 'uploads files', b: 'presigned PUT', l: [862, 206, 'start'] },
  { pts: [[935, 314], [935, 408]], p: 0, a: 'triggers', b: 'S3 event', l: [943, 366, 'start'] },
  { pts: [[850, 442], [742, 442]], p: 0, a: 'marks ready', b: 'UpdateItem', l: [796, 434, 'middle'] },
  { pts: [[650, 314], [650, 408]], p: 0, a: 'reads, writes drafts', b: 'read / write', l: [658, 366, 'start'] },
  { pts: [[560, 306], [362, 408]], p: 0, a: 'publishes release', b: 'PutObject + invalidate', l: [470, 382, 'start'] },
  { pts: [[935, 474], [935, 508], [105, 508], [105, 476]], p: 0, a: 'writes renditions (resized photos, web-ready video)', b: 'PutObject · renditions', l: [520, 500, 'middle'] },
]

function legend(y) {
  const items = [
    ['line', C.path, 'visitor path'], ['line', C.muted, 'editing & background work'],
    ['box', C.card, 'service or app'], ['box', C.store, 'data store'], ['dash', C.card, 'outside the system'],
  ]
  let x = 40, out = ''
  for (const [kind, color, label] of items) {
    if (kind === 'line') out += `<line x1="${x}" y1="${y - 4}" x2="${x + 22}" y2="${y - 4}" stroke="${color}" stroke-width="2"/>`
    else out += `<rect x="${x + 4}" y="${y - 10}" width="14" height="12" rx="4" fill="${color}" stroke="${C.line}"${kind === 'dash' ? ' stroke-dasharray="3 2"' : ''}/>`
    out += text('t-edge', x + 30, y, label)
    x += 40 + label.length * 6.8 + 16
  }
  return out
}

function map(view) {
  const o = []
  o.push(text('t-title', 40, 42, view === 'a' ? 'Components' : 'The same map, on AWS'))
  o.push(`<g transform="translate(${OX} ${OY})">`)
  if (view === 'b') {
    o.push('<rect class="bound" x="8" y="99" width="1024" height="493" rx="20"/>')
    o.push(text('t-bound', 1012, 112, 'HAI-PROD AWS ACCOUNT', 'end'))
  }
  o.push('<rect class="band" x="20" y="536" width="1000" height="40" rx="14"/>')
  o.push(text('t-band', 520, 560, view === 'a'
    ? 'Shared contract · contracts/ (OpenAPI + JSON Schema) → generated TypeScript and Java types · packages/ui (site components)'
    : 'Defined in AWS CDK (infra/) · stacks: Dns · Edge · Network · Data · Auth · Api · Media · WebPublic · WebAdmin · Ops', 'middle'))
  for (const e of E) {
    const d = e.pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')
    o.push(`<path class="e${e.p ? ' path' : ''}" d="${d}" marker-end="url(#${e.p ? 'ahp' : 'ah'})"/>`)
    o.push(text(`t-edge${e.p ? ' path' : ''}`, e.l[0], e.l[1], e[view], e.l[2]))
  }
  for (const n of Object.values(N)) {
    const kind = view === 'b' && n.bk ? n.bk : n.k
    const cx = n.x + n.w / 2
    const lab = n[view]
    o.push(`<rect class="n-${kind}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${kind === 'person' ? n.h / 2 : 14}"/>`)
    if (kind === 'person') o.push(text('t-name', cx, n.y + 27, lab[0], 'middle'))
    else if (view === 'a') {
      o.push(text('t-name', cx, n.y + 28, lab[0], 'middle'))
      o.push(text('t-sub', cx, n.y + 46, lab[1], 'middle'))
    } else {
      o.push(text('t-eye', cx, n.y + 18, lab[0], 'middle'))
      o.push(text('t-name', cx, n.y + 37, lab[1], 'middle'))
      o.push(text('t-sub', cx, n.y + 54, lab[2], 'middle'))
    }
  }
  o.push('</g>')
  if (view === 'a') o.push(legend(OY + 612))
  else o.push(text('t-edge', 40, OY + 612, 'Regional services run in ap-south-1 (Mumbai). CloudFront, ACM certificates (us-east-1) and Route 53 are global.'))
  return o.join('\n')
}

/* ------------------------------------------------------------------ */
/* 3. Accounts and delivery                                            */
/* ------------------------------------------------------------------ */

function accounts() {
  const box = (x, y, w, h, title, lines, last) => {
    let s = `<rect class="n-comp" x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/>` + text('t-name', x + 20, y + 28, title)
    lines.forEach((l, i) => { s += text('t-sub', x + 20, y + 56 + i * 20, l) })
    if (last) s += text('t-sub', x + 20, y + h - 24, last)
    return s
  }
  return [
    text('t-title', 40, 42, 'Accounts and delivery'),
    '<g transform="translate(0 44)">',
    `<rect class="n-comp" x="20" y="60" width="210" height="64" rx="16"/>`,
    text('t-name', 125, 88, 'GitHub repository', 'middle'), text('t-sub', 125, 106, 'main · dev · pull requests', 'middle'),
    `<rect class="n-comp" x="20" y="186" width="210" height="64" rx="16"/>`,
    text('t-name', 125, 214, 'GitHub Actions', 'middle'), text('t-sub', 125, 232, 'test · build · cdk deploy', 'middle'),
    '<path class="e" d="M125 124 V184" marker-end="url(#ah)"/>', text('t-edge', 133, 159, 'on push'),
    '<rect class="bound" x="262" y="20" width="758" height="296" rx="20"/>', text('t-bound', 282, 44, 'AWS ORGANIZATION'),
    box(290, 60, 220, 190, 'Management account',
      ['IAM Identity Center sign-in', 'Org-wide CloudTrail', 'Budgets and billing', 'Service control policies', 'Root: role mailbox + MFA'], 'No website resources'),
    '<path class="e ret" d="M512 150 H538" marker-end="url(#ah)"/>',
    '<path class="e ret" d="M762 150 H788" marker-end="url(#ah)"/>',
    box(540, 60, 220, 190, 'hai-staging',
      ['Same stacks as production', 'Own data, own users', '*.cloudfront.net URLs', 'until a domain is ready'], 'Deploys from dev'),
    box(790, 60, 210, 190, 'hai-prod',
      ['Route 53 zone(s)', 'Canonical domain', '+ redirecting aliases', 'Data stacks retained'], 'Deploys from main'),
    '<path class="e path" d="M230 232 H250 V280 H650 V252" marker-end="url(#ahp)"/>',
    '<path class="e path" d="M650 280 H895 V252" marker-end="url(#ahp)"/>',
    text('t-edge path', 658, 270, 'dev'), text('t-edge path', 903, 270, 'main + approval'),
    text('t-edge path', 450, 300, 'assumes an IAM role via OIDC · no stored keys', 'middle'),
    '</g>',
    text('t-edge', 40, 392, 'Dashed arrows: people sign in once through IAM Identity Center and get scoped access to each workload account.'),
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/* 4-6. Sequence diagrams                                              */
/* ------------------------------------------------------------------ */

const SEQ_W = 1240
function sequence(title, parts, steps, footer) {
  const left = 110, right = SEQ_W - 110
  const gap = (right - left) / (parts.length - 1)
  const X = Object.fromEntries(parts.map((p, i) => [p.id, left + i * gap]))
  const top = 64, headH = 50, row = 44
  const firstY = top + headH + 40
  const bottom = firstY + (steps.length - 1) * row + 30
  const o = [text('t-title', 40, 42, title)]
  for (const p of parts) {
    const w = Math.min(gap - 14, 150)
    o.push(`<line class="life" x1="${X[p.id]}" y1="${top + headH}" x2="${X[p.id]}" y2="${bottom}"/>`)
    o.push(`<rect class="n-${p.k || 'comp'}" x="${X[p.id] - w / 2}" y="${top}" width="${w}" height="${headH}" rx="${p.k === 'person' ? 25 : 12}"/>`)
    o.push(text('t-name', X[p.id], top + (p.sub ? 22 : 30), p.name, 'middle'))
    if (p.sub) o.push(text('t-sub', X[p.id], top + 38, p.sub, 'middle'))
  }
  steps.forEach((s, i) => {
    const y = firstY + i * row
    const n = i + 1
    if (s.note) {
      const x = X[s.note]
      const w = s.text.length * 6.6 + 44
      o.push(`<rect class="note" x="${x - w / 2}" y="${y - 20}" width="${w}" height="28" rx="8"/>`)
      o.push(`<circle cx="${x - w / 2 + 16}" cy="${y - 6}" r="9" fill="${C.path}"/>`, text('t-num', x - w / 2 + 16, y - 2.5, n, 'middle'))
      o.push(text('t-edge path', x - w / 2 + 32, y - 2, s.text))
      return
    }
    const x1 = X[s.from], x2 = X[s.to]
    const dir = x2 > x1 ? 1 : -1
    const cls = `e${s.p ? ' path' : ''}${s.ret ? ' ret' : ''}`
    o.push(`<path class="${cls}" d="M${x1} ${y} H${x2 - dir * 2}" marker-end="url(#${s.p ? 'ahp' : 'ah'})"/>`)
    const mid = (x1 + x2) / 2
    const lw = s.text.length * 6.6
    const nx = mid - lw / 2 - 14
    o.push(`<circle cx="${nx}" cy="${y - 10}" r="9" fill="${s.p ? C.path : C.muted}"/>`, text('t-num', nx, y - 6.5, n, 'middle'))
    o.push(text(`t-edge${s.p ? ' path' : ''}`, mid, y - 6, s.text, 'middle'))
  })
  if (footer) o.push(text('t-edge path', 40, bottom + 34, footer))
  return { body: o.join('\n'), h: bottom + (footer ? 58 : 30) }
}

const flows = [
  {
    file: 'process-seq-visitor-views-page.svg',
    title: 'A visitor opens a news article',
    parts: [
      { id: 'b', name: 'Browser', sub: 'visitor', k: 'person' },
      { id: 'cf', name: 'CloudFront', sub: 'public' },
      { id: 'fn', name: 'CF Function', sub: 'SPA rewrite' },
      { id: 'web', name: 'S3', sub: 'web-public', k: 'store' },
      { id: 'con', name: 'S3', sub: 'content', k: 'store' },
      { id: 'med', name: 'S3', sub: 'media', k: 'store' },
    ],
    steps: [
      { from: 'b', to: 'cf', text: 'GET /news/<slug>', p: 1 },
      { from: 'cf', to: 'fn', text: 'viewer request', p: 1 },
      { from: 'fn', to: 'cf', text: 'rewrite → /index.html', p: 1, ret: 1 },
      { from: 'cf', to: 'web', text: 'GET /index.html (cache miss only)', p: 1 },
      { from: 'cf', to: 'b', text: 'index.html + assets', p: 1, ret: 1 },
      { from: 'b', to: 'cf', text: 'GET /content/current.json', p: 1 },
      { from: 'cf', to: 'con', text: 'cache miss only · cached 30 s', p: 1 },
      { from: 'b', to: 'cf', text: 'GET releases/<id>/news.json', p: 1 },
      { from: 'cf', to: 'con', text: 'cache miss only · cached 1 year', p: 1 },
      { from: 'b', to: 'cf', text: 'GET /media/<id>/960.webp', p: 1 },
      { from: 'cf', to: 'med', text: 'cache miss only · cached 1 year', p: 1 },
    ],
    footer: 'No Lambda and no database on the visitor path.',
  },
  {
    file: 'process-seq-editor-uploads-media.svg',
    title: 'An editor uploads a video',
    parts: [
      { id: 'd', name: 'Dashboard', sub: 'editor', k: 'person' },
      { id: 'api', name: 'Content API', sub: 'Java · Lambda' },
      { id: 'db', name: 'DynamoDB', sub: 'content DB', k: 'store' },
      { id: 'up', name: 'S3', sub: 'uploads', k: 'store' },
      { id: 'pr', name: 'Processor', sub: 'Lambda' },
      { id: 'mc', name: 'MediaConvert', sub: 'video jobs' },
      { id: 'med', name: 'S3', sub: 'media', k: 'store' },
    ],
    steps: [
      { from: 'd', to: 'api', text: 'ask for upload URL' },
      { from: 'api', to: 'db', text: 'create: uploading' },
      { from: 'api', to: 'd', text: 'presigned URLs', ret: 1 },
      { from: 'd', to: 'up', text: 'PUT parts directly (resumable)' },
      { from: 'up', to: 'pr', text: 'S3 event' },
      { note: 'pr', text: 'check real file type' },
      { from: 'pr', to: 'mc', text: 'start job' },
      { from: 'mc', to: 'med', text: '720p + 1080p + poster' },
      { from: 'mc', to: 'pr', text: 'done (EventBridge)', ret: 1 },
      { from: 'pr', to: 'db', text: 'mark ready' },
      { from: 'd', to: 'api', text: 'place in slot' },
    ],
    footer: 'Files go straight from the browser to S3 and never pass through the API.',
  },
  {
    file: 'process-seq-admin-publishes.svg',
    title: 'An admin publishes',
    parts: [
      { id: 'd', name: 'Dashboard', sub: 'admin', k: 'person' },
      { id: 'cf', name: 'CloudFront', sub: 'WAF · VPC origin' },
      { id: 'fn', name: 'Content API', sub: 'Java · Lambda' },
      { id: 'db', name: 'DynamoDB', sub: 'content DB', k: 'store' },
      { id: 'con', name: 'S3', sub: 'content', k: 'store' },
    ],
    steps: [
      { from: 'd', to: 'cf', text: 'POST /api/publish + token' },
      { note: 'cf', text: 'WAF rules + rate limit' },
      { from: 'cf', to: 'fn', text: 'internal ALB → Lambda' },
      { note: 'fn', text: 'verify JWT · require admin' },
      { from: 'fn', to: 'db', text: 'read published items' },
      { from: 'fn', to: 'con', text: 'write releases/<time>/*.json' },
      { from: 'fn', to: 'con', text: 'swap current.json pointer' },
      { from: 'fn', to: 'db', text: 'record release + audit' },
      { from: 'fn', to: 'cf', text: 'invalidate current.json' },
      { from: 'fn', to: 'd', text: 'published', ret: 1 },
    ],
    footer: 'Roll back = point current.json at an earlier release. Visitors see changes within about a minute.',
  },
]

/* ------------------------------------------------------------------ */
/* 7. Logical view: domain model                                        */
/* ------------------------------------------------------------------ */

function cls(x, y, w, name, attrs, stereo) {
  const head = stereo ? 44 : 30
  const h = head + attrs.length * 17 + 12
  let s = `<rect class="n-comp" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`
  s += `<path d="M${x} ${y + head} H${x + w}" stroke="${C.line}"/>`
  if (stereo) s += text('t-sub', x + w / 2, y + 17, `«${stereo}»`, 'middle')
  s += text('t-name', x + w / 2, y + (stereo ? 35 : 20), name, 'middle')
  attrs.forEach((a, i) => { s += text('t-sub', x + 14, y + head + 18 + i * 17, a) })
  return s
}
const line = (d, extra = '') => `<path class="e" d="${d}" ${extra}/>`
const mult = (x, y, s, anchor = 'start') => text('t-edge', x, y, s, anchor)

function domain() {
  return [
    text('t-title', 40, 42, 'Logical view · domain model'),
    cls(40, 70, 300, 'Content types', ['NewsArticle', 'Project', 'Member', 'Publication', 'Gallery', 'PageSection', 'SiteSettings'], 'content type'),
    cls(450, 70, 320, 'ContentItem', ['id, type, slug', 'title, summary', 'body: Markdown', 'fields: per type', 'mediaRefs: MediaAsset[]', 'status: draft | published | unpublished', 'version: number', 'publishedVersion?: number', 'updatedBy, updatedAt'], 'abstract'),
    cls(880, 70, 320, 'Release', ['id: ISO timestamp', 'publishedBy: User', 'note', 'snapshotPrefix: S3 key', 'isCurrent: boolean']),
    cls(40, 340, 300, 'Placement', ['slotKey', 'mediaId', 'order: number', 'visible: boolean', 'updatedBy']),
    cls(450, 340, 320, 'MediaAsset', ['id (content-addressed)', 'kind: image | video | embed', 'status: uploading | processing |', '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0ready | failed', 'originalKey (uploads bucket)', 'altText (required), caption', 'width, height, durationSec', 'embedUrl? (YouTube / Vimeo)', 'uploadedBy, createdAt']),
    cls(880, 340, 320, 'User', ['sub (Cognito id)', 'email, name', 'role: editor | admin', 'status: invited | active | disabled', 'lastSignInAt']),
    cls(40, 600, 300, 'Slot', ['key, e.g. home.hero', 'label', 'accepts: image | video', 'maxItems']),
    cls(450, 600, 320, 'Rendition', ['key (media bucket)', 'format: webp | avif | mp4 | jpg', 'width, bytes', 'role: srcset | video | poster']),
    cls(880, 600, 320, 'AuditEvent', ['at, userId', 'action: create | update | publish ...', 'entityRef', 'summary']),

    line('M340 140 H448', 'marker-end="url(#tri)"'), text('t-edge', 394, 132, 'is a', 'middle'),
    line('M880 140 H772', 'marker-end="url(#oa)"'), text('t-edge', 825, 132, 'captures', 'middle'),
    mult(876, 158, '0..*', 'end'), mult(774, 158, '1..*'),
    line('M610 279 V338', 'marker-end="url(#oa)"'), text('t-edge', 618, 314, 'references'),
    mult(602, 294, '0..*', 'end'), mult(602, 334, '0..*', 'end'),
    line('M340 400 H448', 'marker-end="url(#oa)"'), text('t-edge', 394, 392, 'shows', 'middle'),
    mult(344, 416, '0..*'), mult(446, 416, '1', 'end'),
    line('M880 400 H772', 'marker-end="url(#oa)"'), text('t-edge', 825, 392, 'uploads', 'middle'),
    mult(876, 416, '1', 'end'), mult(774, 416, '0..*'),
    line('M190 598 V469', 'marker-end="url(#oa)"'), text('t-edge', 198, 538, 'contains'),
    mult(182, 592, '1', 'end'), mult(182, 484, '0..*', 'end'),
    line('M610 536 V598', 'marker-start="url(#dia)"'), text('t-edge', 618, 572, 'has'),
    mult(602, 592, '1..*', 'end'),
    line('M1040 469 V598', 'marker-end="url(#oa)"'), text('t-edge', 1048, 538, 'performs'),
    mult(1032, 592, '0..*', 'end'),
    line('M1040 338 V199', 'marker-end="url(#oa)"'), text('t-edge', 1048, 272, 'publishes'),
    mult(1032, 214, '0..*', 'end'),
    text('t-edge', 40, 760, 'Open arrow = association (read in arrow direction) · hollow triangle = "is a" · filled diamond = owns (deleted together).'),
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/* 8. Process view: lifecycles                                          */
/* ------------------------------------------------------------------ */

function st(x, y, w, label, sub) {
  let s = `<rect class="n-comp" x="${x}" y="${y}" width="${w}" height="44" rx="22"/>`
  s += text('t-name', x + w / 2, y + (sub ? 20 : 27), label, 'middle')
  if (sub) s += text('t-sub', x + w / 2, y + 35, sub, 'middle')
  return s
}
const startDot = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="${C.text}"/>`
const endDot = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${C.text}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="6" fill="${C.text}"/>`
const tr = (d) => `<path class="e" d="${d}" marker-end="url(#ah)"/>`

function lifecycles() {
  return [
    text('t-title', 40, 42, 'Process view · lifecycles'),
    text('t-bound', 40, 80, 'MEDIA ASSET'),
    startDot(60, 122), tr('M68 122 H108'),
    st(110, 100, 150, 'uploading', 'URL issued'),
    st(380, 100, 150, 'processing', 'sharp / MediaConvert'),
    st(650, 100, 150, 'ready', 'usable in content'),
    st(960, 100, 150, 'deleted'),
    st(380, 210, 150, 'failed', 'reason recorded'),
    endDot(1170, 122),
    tr('M260 122 H378'), text('t-edge', 319, 114, 'S3 event', 'middle'),
    tr('M530 122 H648'), text('t-edge', 589, 114, 'renditions saved', 'middle'),
    tr('M800 122 H958'), text('t-edge', 879, 114, 'delete · if unused', 'middle'),
    tr('M1110 122 H1158'),
    tr('M430 144 V208'), text('t-edge', 422, 180, 'bad file / job error', 'end'),
    tr('M480 210 V146'), text('t-edge', 488, 180, 'retry (admin)'),
    tr('M530 232 H1010 V146'), text('t-edge', 770, 226, 'discard', 'middle'),
    tr('M185 144 V290 H1060 V146'), text('t-edge', 620, 284, 'upload not finished within 24 h → cleaned up', 'middle'),

    text('t-bound', 40, 360, 'CONTENT ITEM'),
    startDot(60, 412), tr('M68 412 H108'),
    st(110, 390, 140, 'draft', 'never visible'),
    st(380, 390, 160, 'published', 'in current release'),
    st(680, 390, 190, 'published, edited', 'draft differs from live'),
    st(380, 520, 160, 'unpublished', 'hidden'),
    st(960, 520, 150, 'deleted'),
    endDot(1170, 542),
    tr('M250 412 H378'), text('t-edge', 314, 404, 'publish', 'middle'),
    tr('M540 412 H678'), text('t-edge', 609, 404, 'edit', 'middle'),
    tr('M775 390 V366 H460 V388'), text('t-edge', 617, 360, 'publish', 'middle'),
    tr('M430 434 V518'), text('t-edge', 422, 480, 'unpublish', 'end'),
    tr('M490 520 V436'), text('t-edge', 498, 480, 'publish'),
    tr('M540 542 H958'), text('t-edge', 750, 534, 'delete', 'middle'),
    tr('M180 434 V600 H1035 V566'), text('t-edge', 610, 594, 'delete (never published)', 'middle'),
    tr('M1110 542 H1158'),
    text('t-edge path', 40, 646, 'Only an admin can publish. Visitors see items exactly as captured in the current release.'),
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/* 9. Development view: packages and dependencies                       */
/* ------------------------------------------------------------------ */

function nodeBox(x, y, w, h, name, sub, kind = 'comp') {
  let s = `<rect class="n-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/>`
  s += text('t-name', x + w / 2, y + h / 2 - (sub ? 3 : -5), name, 'middle')
  if (sub) s += text('t-sub', x + w / 2, y + h / 2 + 14, sub, 'middle')
  return s
}

function packages() {
  const units = [
    ['apps/web', 'public website · TS'], ['apps/admin', 'dashboard · TS'],
    ['services/media', 'media processor · Node'], ['services/content-api', 'Java 21 · Lambda'], ['infra', 'CDK · deploys all units'],
  ]
  const o = [text('t-title', 40, 42, 'Development view · repository and dependencies')]
  o.push(text('t-bound', 60, 70, 'DEPLOYABLE UNITS'))
  units.forEach(([n, s], i) => o.push(nodeBox(60 + i * 230, 80, 200, 64, n, s)))
  o.push(text('t-bound', 640, 214, 'SHARED AND GENERATED CODE'))
  o.push(nodeBox(175, 224, 200, 64, 'packages/ui', 'presentational components', 'store'))
  o.push(nodeBox(60, 340, 660, 60, 'packages/content-schema', 'generated TypeScript types + Zod validators', 'store'))
  o.push(nodeBox(750, 340, 200, 60, 'Java contract', 'generated DTOs + interfaces', 'store'))
  o.push(nodeBox(60, 440, 890, 52, 'contracts/', 'OpenAPI 3.1 + JSON Schema · the single source of truth for API and release files'))
  o.push(
    tr('M220 144 V222'), tr('M330 144 V222'), tr('M275 288 V338'),
    tr('M100 144 V338'), tr('M450 144 V338'), tr('M620 144 V338'), tr('M850 144 V338'),
    text('t-edge', 628, 250, 'imports'), text('t-edge', 858, 250, 'uses'),
    '<path class="e ret" d="M390 400 V438" marker-end="url(#ah)"/>', text('t-edge', 398, 424, 'generated from'),
    '<path class="e ret" d="M850 400 V438" marker-end="url(#ah)"/>', text('t-edge', 858, 424, 'generated at build'),
  )
  o.push(text('t-bound', 60, 530, 'MAIN THIRD-PARTY LIBRARIES'))
  o.push(
    nodeBox(60, 540, 430, 40, 'React 19 · TanStack Router & Query · Tailwind v4', '', 'ext'),
    nodeBox(520, 540, 200, 40, 'sharp · AWS SDK v3', '', 'ext'),
    nodeBox(750, 540, 200, 40, 'Spring Boot 3 · AWS SDK v2', '', 'ext'),
    nodeBox(980, 540, 200, 40, 'AWS CDK v2', '', 'ext'),
  )
  o.push('<rect class="bound" x="40" y="620" width="1160" height="120" rx="18"/>')
  o.push(text('t-bound', 60, 644, 'INSIDE services/content-api (layering enforced by ArchUnit; services/media follows the same shape)'))
  o.push(
    nodeBox(60, 660, 300, 60, 'web', 'controllers · security · validation'),
    nodeBox(470, 660, 300, 60, 'domain', 'use cases · ports · no AWS SDK', 'store'),
    nodeBox(880, 660, 300, 60, 'adapters', 'DynamoDB · S3 · SES · Cognito · CloudFront'),
    tr('M360 690 H468'), text('t-edge', 414, 682, 'calls', 'middle'),
    tr('M880 690 H772'), text('t-edge', 826, 682, 'implements', 'middle'),
  )
  o.push(text('t-edge', 40, 772, 'Arrows point from the user to what it uses. Nothing imports an app or a service; contracts/ changes regenerate both languages.'))
  return o.join('\n')
}

/* ------------------------------------------------------------------ */
/* 11. Evolution: from S3 hosting to a dynamic site                     */
/* ------------------------------------------------------------------ */

function evolution() {
  const stages = [
    { title: 'Now · static site + Java API', rows: [
      ['/*', 'S3 · SPA (index.html)', 0], ['/content/*  /media/*', 'S3 · releases and media', 0], ['/api/*', 'Java API on Lambda (via ALB)', 0]],
      notes: ['Pages render in the browser', 'SEO: weak · compute: API only'] },
    { title: 'Next · prerendered pages', rows: [
      ['/*', 'S3 · HTML rendered on publish', 1], ['/content/*  /media/*', 'S3 · releases and media', 0], ['/api/*', 'Java API on Lambda (via ALB)', 0]],
      notes: ['Publish also writes one HTML file per page', 'SEO: good · still no page servers'] },
    { title: 'Later · server-rendered site', rows: [
      ['/*', 'SSR app (Node) on the same ALB', 1], ['/assets/*  /media/*', 'S3 · assets and media', 0], ['/api/*', 'Java API on Lambda (via ALB)', 0]],
      notes: ['Per-request pages, member logins, search', 'Same CloudFront, WAF and ALB'] },
  ]
  const o = [text('t-title', 40, 42, 'Growth path · S3 stays for files, compute is added behind CloudFront')]
  stages.forEach((st, i) => {
    const x0 = 20 + i * 405
    o.push(`<rect class="band" x="${x0}" y="64" width="385" height="350" rx="16"/>`)
    o.push(text('t-name', x0 + 20, 92, st.title))
    o.push(`<rect class="n-comp" x="${x0 + 20}" y="108" width="345" height="44" rx="12"/>`, text('t-name', x0 + 192, 135, 'CloudFront + WAF', 'middle'))
    o.push(`<path class="e" d="M${x0 + 44} 152 V${176 + 2 * 62 + 22}"/>`)
    st.rows.forEach(([path, target, changed], j) => {
      const y = 176 + j * 62
      o.push(`<path class="e${changed ? ' path' : ''}" d="M${x0 + 44} ${y + 22} H${x0 + 62}" marker-end="url(#${changed ? 'ahp' : 'ah'})"/>`)
      o.push(`<rect class="${changed ? 'note' : (target.startsWith('S3') ? 'n-store' : 'n-comp')}" x="${x0 + 64}" y="${y}" width="301" height="44" rx="12"/>`)
      o.push(text('t-sub', x0 + 80, y + 17, path), text('t-name', x0 + 80, y + 35, target))
    })
    st.notes.forEach((n, k) => o.push(text(k ? 't-edge' : 't-edge path', x0 + 20, 384 + k * 18, n)))
  })
  o.push(text('t-edge', 40, 446, 'Teal = the one route that changes at each step. Assets, media and releases stay on S3 throughout.'))
  return o.join('\n')
}

/* ------------------------------------------------------------------ */
/* 10. Scenarios: use cases                                             */
/* ------------------------------------------------------------------ */

function actor(x, y, label) {
  return [
    `<circle cx="${x}" cy="${y - 30}" r="10" fill="${C.person}" stroke="${C.text}" stroke-width="1.4"/>`,
    `<path d="M${x} ${y - 20} V${y + 10} M${x - 16} ${y - 8} H${x + 16} M${x} ${y + 10} L${x - 12} ${y + 30} M${x} ${y + 10} L${x + 12} ${y + 30}" stroke="${C.text}" stroke-width="1.4" fill="none"/>`,
    text('t-name', x, y + 50, label, 'middle'),
  ].join('')
}
function oval(cx, cy, label, rx = 150, cls = 'n-comp') {
  return `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="19"/>` + text('t-name', cx, cy + 5, label, 'middle')
}

function usecases() {
  const o = [text('t-title', 40, 42, 'Scenarios · use cases')]
  o.push('<rect class="bound" x="220" y="60" width="820" height="740" rx="20"/>', text('t-bound', 240, 84, 'HAI PLATFORM'))
  const groups = [
    { x: 110, y: 170, name: 'Visitor', cases: ['Browse pages', 'Read news & projects', 'Watch videos, view galleries', 'Send a contact message'], y0: 110 },
    { x: 110, y: 400, name: 'Editor', cases: ['Sign in with MFA', 'Edit drafts', 'Upload photos & videos', 'Place media in slots', 'Preview changes'], y0: 320 },
    { x: 110, y: 670, name: 'Admin', cases: ['Publish', 'Roll back a release', 'Invite & manage users', 'Delete media', 'View audit log'], y0: 590 },
  ]
  for (const g of groups) {
    o.push(actor(g.x, g.y, g.name))
    g.cases.forEach((c, i) => {
      const cy = g.y0 + i * 46
      o.push(`<path class="e" d="M${g.x + 20} ${g.y - 8} L288 ${cy}"/>`)
      o.push(oval(440, cy, c))
    })
  }
  // Admin inherits Editor
  o.push(`<path class="e" d="M110 626 V462" marker-end="url(#tri)"/>`, text('t-edge', 118, 545, 'inherits'))
  // includes
  o.push(oval(870, 412, 'Process media', 130, 'n-store'))
  o.push(`<path class="e ret" d="M590 412 H738" marker-end="url(#oa)"/>`, text('t-edge', 664, 404, '«include»', 'middle'))
  o.push(oval(870, 590, 'Build release snapshot', 130, 'n-store'))
  o.push(`<path class="e ret" d="M590 590 H738" marker-end="url(#oa)"/>`, text('t-edge', 664, 582, '«include»', 'middle'))
  o.push(oval(870, 660, 'Refresh CDN cache', 130, 'n-store'))
  o.push(`<path class="e ret" d="M590 636 L744 656" marker-end="url(#oa)"/>`, text('t-edge', 664, 638, '«include»', 'middle'))
  o.push(`<path class="e ret" d="M870 609 V639" marker-end="url(#oa)"/>`)
  // system actor
  o.push(`<rect class="n-comp" x="1070" y="386" width="150" height="52" rx="12"/>`, text('t-sub', 1145, 404, '«system»', 'middle'), text('t-name', 1145, 424, 'Media processor', 'middle'))
  o.push(`<path class="e" d="M1000 412 H1070"/>`)
  o.push(text('t-edge', 40, 840, 'Tinted ovals are internal steps that other use cases include. They are never started directly by a person.'))
  return o.join('\n')
}

/* ------------------------------------------------------------------ */

const files = {
  'logical-components.svg': doc(1080, 700, map('a'), 'Component architecture of the Human-AI Lab platform'),
  'physical-aws-deployment.svg': doc(1080, 700, map('b'), 'The component map deployed on AWS'),
  'physical-accounts-delivery.svg': doc(1040, 412, accounts(), 'AWS accounts and delivery pipeline'),
  'logical-domain-model.svg': doc(1240, 780, domain(), 'Logical view: domain model'),
  'process-lifecycles.svg': doc(1240, 670, lifecycles(), 'Process view: media asset and content item lifecycles'),
  'development-packages.svg': doc(1240, 800, packages(), 'Development view: repository packages and dependencies'),
  'scenarios-use-cases.svg': doc(1240, 860, usecases(), 'Scenarios: use cases'),
  'physical-growth-path.svg': doc(1240, 470, evolution(), 'Growth path from S3 hosting to a server-rendered site'),
}
for (const f of flows) {
  const s = sequence(f.title, f.parts, f.steps, f.footer)
  files[f.file] = doc(SEQ_W, s.h, s.body, f.title)
}
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg)
  console.log('wrote', name)
}
