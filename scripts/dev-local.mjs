// Runs the whole platform locally, no Cloudflare account needed:
//   Content API  http://localhost:8080  (the hai-admin Worker in `wrangler dev`, data in .local-data/cloudflare/)
//   Dashboard    http://localhost:6015  (sign-in is simulated: switch between Admin and Editor in the sidebar)
//   Website      http://localhost:6014  (reads published releases from the API)
// Stop everything with Ctrl+C. The Java Content API still runs on its own: `cd services/content-api && ./gradlew bootRun`.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

// The Worker serves the dashboard's built files too, so they must exist once.
if (!existsSync(join(root, 'apps/admin/dist'))) {
  spawnSync('npm', ['run', 'build', '-w', '@hai/admin'], { cwd: root, stdio: 'inherit' })
}

const services = [
  {
    name: 'api  ',
    color: 33,
    cmd: 'npx',
    args: ['wrangler', 'dev', '-c', 'cloudflare/admin/wrangler.jsonc', '--port', '8080', '--var', 'SIMULATED_SIGN_IN:true',
      '--persist-to', '.local-data/cloudflare', '--show-interactive-dev-session=false'],
  },
  { name: 'admin', color: 35, cmd: 'npm', args: ['run', 'dev', '-w', '@hai/admin'] },
  { name: 'web  ', color: 36, cmd: 'npm', args: ['run', 'dev:releases', '-w', '@hai/web'] },
]

const children = services.map(({ name, color, cmd, args }) => {
  // Each service gets its own process group, so stopping it also stops npm's and wrangler's child processes.
  const child = spawn(cmd, args, { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'], detached: true })
  const prefix = `\x1b[${color}m${name}\x1b[0m │ `
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) if (line.trim()) process.stdout.write(prefix + line + '\n')
    })
  }
  child.on('exit', (code) => process.stdout.write(`${prefix}exited (${code})\n`))
  return child
})

console.log('\nDashboard: http://localhost:6015   Website: http://localhost:6014   API: http://localhost:8080\n')

function stop() {
  for (const child of children) {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      // Already exited.
    }
  }
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
