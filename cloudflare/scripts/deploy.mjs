// Deploys the whole platform to Cloudflare in one go: `npm run cf:deploy` from the repository root.
// Safe to run again at any time; every step is idempotent. See cloudflare/README.md.
//
// Needs: Node 22 and a Cloudflare login (`npx wrangler login`, or CLOUDFLARE_API_TOKEN).
// Reads from the environment (or a git-ignored .env file at the repository root):
//   CLOUDFLARE_ACCOUNT_ID  only if your login has more than one account
//   ADMIN_EMAILS           who can publish, comma-separated (README step 3); kept out of the public repo
//   BREVO_API_KEY          optional, sends contact-form messages (README step 4)
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../..', import.meta.url).pathname
const ADMIN = 'cloudflare/admin/wrangler.jsonc'
const SITE = 'cloudflare/site/wrangler.jsonc'
const WRANGLER = 'node_modules/.bin/wrangler'
/** Settings stored as Worker secrets rather than in the public repository. */
const SECRETS = ['ADMIN_EMAILS', 'BREVO_API_KEY']

loadDotEnv()
const config = readJsonc(ADMIN)
const settings = config.vars
const bucketName = config.r2_buckets[0].bucket_name

step('Checking the Cloudflare login')
const accountId = findAccountId()
ok(`Cloudflare account ${accountId}`)

step(`Creating the R2 bucket ${bucketName} (if needed)`)
const bucket = wrangler(['r2', 'bucket', 'create', bucketName], { quiet: true })
if (bucket.status !== 0 && !/already exists/i.test(bucket.output)) {
  fail(`Could not create the R2 bucket:\n${bucket.output}\nIs R2 enabled on the account? (Dashboard → R2 → Get started)`)
}
ok('Bucket ready')

step('Building the dashboard and the website')
run('npm', ['run', 'build', '-w', '@hai/admin'])
run('npm', ['run', 'build', '-w', '@hai/web'], { VITE_CONTENT_SOURCE: 'releases' })

step('Deploying the dashboard and the Content API')
const admin = await wranglerStreaming(['deploy', '-c', ADMIN])
if (admin.status !== 0) {
  fail('Deploying hai-admin failed; see the output above.')
}
const secrets = Object.fromEntries(SECRETS.filter((name) => process.env[name]?.trim()).map((name) => [name, process.env[name].trim()]))
if (Object.keys(secrets).length) {
  step('Storing the secrets')
  const put = wrangler(['secret', 'bulk', '-c', ADMIN], { input: JSON.stringify(secrets), quiet: true })
  if (put.status !== 0) {
    fail(`Could not store the secrets:\n${put.output}`)
  }
  ok(`Stored ${Object.keys(secrets).join(', ')}`)
}

step('Deploying the public website')
const site = await wranglerStreaming(['deploy', '-c', SITE])
if (site.status !== 0) {
  fail('Deploying hai-site failed; see the output above.')
}
const siteUrl = workersDevUrl(site.output, 'hai-site')
const adminUrl = workersDevUrl(admin.output, 'hai-admin')

if (siteUrl) {
  step('Checking the website (on the first deploy this imports the site content and publishes it)')
  if (await warmUp(siteUrl)) {
    ok('The website has published content')
  } else {
    warn(`The website has no published content yet. Open ${siteUrl} in a minute; the first visit finishes
  the setup. If it still shows nothing, see "When something goes wrong" in cloudflare/README.md.`)
  }
}

console.log('\n────────────────────────────────────────────────────────────')
console.log(`  Website    ${siteUrl ?? '(see the hai-site output above)'}`)
console.log(`  Dashboard  ${adminUrl ?? '(see the hai-admin output above)'}`)
console.log('────────────────────────────────────────────────────────────')
const todo = []
if (!settings.ACCESS_TEAM_DOMAIN || !settings.ACCESS_AUD) {
  todo.push('Protect the dashboard with Cloudflare Access, then set ACCESS_TEAM_DOMAIN and ACCESS_AUD (README step 3)')
}
const stored = storedSecretNames()
if (!secrets.ADMIN_EMAILS && !stored.includes('ADMIN_EMAILS')) {
  todo.push('Nobody can publish yet: set ADMIN_EMAILS in .env and deploy again (README step 3)')
}
if (!secrets.BREVO_API_KEY && !stored.includes('BREVO_API_KEY')) {
  todo.push('Contact-form messages are only logged until BREVO_API_KEY is stored (README step 4)')
}
if (todo.length) {
  console.log('\nStill to do:')
  todo.forEach((t) => console.log(`  • ${t}`))
}
console.log('')

// ------------------------------------------------------------------------------------------ helpers

function step(message) {
  console.log(`\n\x1b[1m▸ ${message}\x1b[0m`)
}

function ok(message) {
  console.log(`  \x1b[32m✓\x1b[0m ${message}`)
}

function warn(message) {
  console.log(`  \x1b[33m!\x1b[0m ${message}`)
}

function fail(message) {
  console.error(`\n\x1b[31m✘ ${message}\x1b[0m\n`)
  process.exit(1)
}

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.status !== 0) {
    fail(`${cmd} ${args.join(' ')} failed`)
  }
}

/** Runs wrangler and returns its combined output. */
function wrangler(args, { input, quiet = false } = {}) {
  const result = spawnSync(WRANGLER, args, { cwd: root, encoding: 'utf8', input, env: process.env })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (!quiet) {
    process.stdout.write(output)
  }
  return { status: result.status, output }
}

/** Runs wrangler, showing its output as it goes (image builds are long) and returning it too. */
function wranglerStreaming(args) {
  return new Promise((resolve) => {
    const child = spawn(WRANGLER, args, { cwd: root, env: process.env })
    let output = ''
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', (chunk) => {
        output += chunk
        process.stdout.write(chunk)
      })
    }
    child.on('close', (status) => resolve({ status, output }))
  })
}

function findAccountId() {
  // CI: an API token scoped to one account may not be allowed to list accounts, so trust both settings.
  if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
    return process.env.CLOUDFLARE_ACCOUNT_ID
  }
  const whoami = wrangler(['whoami', '--json'], { quiet: true })
  if (whoami.status !== 0) {
    fail('Not signed in to Cloudflare. Run `npx wrangler login` (or set CLOUDFLARE_API_TOKEN), then run this again.')
  }
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    return process.env.CLOUDFLARE_ACCOUNT_ID
  }
  let accounts = []
  try {
    accounts = JSON.parse(whoami.output.slice(whoami.output.indexOf('{'))).accounts ?? []
  } catch {
    // Fall through to the message below.
  }
  if (accounts.length !== 1) {
    fail(`Set CLOUDFLARE_ACCOUNT_ID to the account to deploy to${accounts.length ? `:\n${accounts.map((a) => `  ${a.id}  ${a.name}`).join('\n')}` : '.'}`)
  }
  process.env.CLOUDFLARE_ACCOUNT_ID = accounts[0].id // so every later wrangler call uses the same account
  return accounts[0].id
}

function storedSecretNames() {
  const list = wrangler(['secret', 'list', '-c', ADMIN, '--format', 'json'], { quiet: true })
  if (list.status !== 0) {
    return [] // not deployed yet
  }
  try {
    return JSON.parse(list.output.slice(list.output.indexOf('['))).map((s) => s.name)
  } catch {
    return []
  }
}

function workersDevUrl(output, name) {
  return output.match(new RegExp(`https://${name}\\.[a-z0-9-]+\\.workers\\.dev`))?.[0]
}

/** Loads the published release pointer through the site; its Worker starts the API when none exists yet. */
async function warmUp(siteUrl) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${siteUrl}/content/current.json`, { signal: AbortSignal.timeout(60_000) })
      if (response.ok) {
        return true
      }
    } catch {
      // A brand-new workers.dev address can take a moment to answer; try again.
    }
    await new Promise((r) => setTimeout(r, 10_000))
  }
  return false
}

/** KEY=VALUE lines from a .env file at the repository root, without overriding the real environment. */
function loadDotEnv() {
  const file = `${root}.env`
  if (!existsSync(file)) {
    return
  }
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

/** Parses a wrangler.jsonc file: JSON with // and /* comments and trailing commas. */
function readJsonc(path) {
  const text = readFileSync(`${root}${path}`, 'utf8')
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      const end = text.indexOf('"', i + 1) // no escaped quotes in our config files
      out += text.slice(i, end + 1)
      i = end
    } else if (c === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i) - 1
      if (i < 0) break
    } else if (c === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i) + 1
    } else {
      out += c
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'))
}
