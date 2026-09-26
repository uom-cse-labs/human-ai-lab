// Runs the whole platform locally, no AWS needed:
//   Content API  http://localhost:8080  (Spring Boot, `local` profile, data in .local-data/)
//   Dashboard    http://localhost:6015
//   Website      http://localhost:6014  (reads published releases from the API)
// Needs Java 21: set JAVA_HOME, or install a JDK under ~/.jdks/. Stop everything with Ctrl+C.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

function javaHome() {
  if (process.env.JAVA_HOME) return process.env.JAVA_HOME
  const jdks = join(homedir(), '.jdks')
  const jdk21 = existsSync(jdks) && readdirSync(jdks).find((d) => d.startsWith('jdk-21'))
  return jdk21 ? join(jdks, jdk21) : undefined
}

const services = [
  { name: 'api  ', color: 33, cwd: join(root, 'services/content-api'), cmd: './gradlew', args: ['bootRun', '--console=plain', '-q'], env: { JAVA_HOME: javaHome() } },
  { name: 'admin', color: 35, cwd: root, cmd: 'npm', args: ['run', 'dev', '-w', '@hai/admin'] },
  { name: 'web  ', color: 36, cwd: root, cmd: 'npm', args: ['run', 'dev:releases', '-w', '@hai/web'] },
]

if (!services[0].env.JAVA_HOME) {
  console.error('Java 21 not found. Set JAVA_HOME to a JDK 21 installation.')
  process.exit(1)
}

const children = services.map(({ name, color, cwd, cmd, args, env }) => {
  // Each service gets its own process group, so stopping it also stops npm's and Gradle's child processes.
  const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'], detached: true })
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
