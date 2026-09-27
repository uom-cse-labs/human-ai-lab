import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { BookOpen, History, Images, Lightbulb, Newspaper, Users } from 'lucide-react'
import { getLocalRole, getSession, setLocalRole, SIMULATED_SIGN_IN, type LocalRole } from '../api/client.ts'

function SignedInAs() {
  const session = getSession()
  return (
    <div className="mt-8 rounded-xl border border-outline-variant px-4 py-3 text-xs text-muted">
      {session ? (
        <>
          <p>Signed in as</p>
          <p className="mt-1 break-all font-semibold text-on-background">{session.name}</p>
          <p className="mt-1">{session.role === 'admin' ? 'Admin: can publish' : 'Editor: drafts only'}</p>
        </>
      ) : (
        <p>Sign-in isn't working yet. Ask the site maintainer to finish the Cloudflare Access setup.</p>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<LocalRole>(getLocalRole())

  function changeRole(next: LocalRole) {
    setLocalRole(next)
    setRole(next)
    window.location.reload()
  }

  const navLink = 'flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-muted hover:bg-surface-dim'
  const active = { className: `${navLink} bg-primary-light !text-primary` }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-outline-variant bg-background px-4 py-5 md:border-b-0 md:border-r">
        <div className="px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Human-AI Lab</p>
          <p className="text-lg font-bold text-primary">Dashboard</p>
        </div>
        <nav className="mt-6 flex flex-wrap gap-1 md:flex-col" aria-label="Sections">
          <Link to="/news" className={navLink} activeProps={active}>
            <Newspaper className="h-4 w-4" aria-hidden /> News
          </Link>
          <Link to="/$section" params={{ section: 'publications' }} className={navLink} activeProps={active}>
            <BookOpen className="h-4 w-4" aria-hidden /> Publications
          </Link>
          <Link to="/$section" params={{ section: 'themes' }} className={navLink} activeProps={active}>
            <Lightbulb className="h-4 w-4" aria-hidden /> Research themes
          </Link>
          <Link to="/$section" params={{ section: 'people' }} className={navLink} activeProps={active}>
            <Users className="h-4 w-4" aria-hidden /> People
          </Link>
          <Link to="/library" className={navLink} activeProps={active}>
            <Images className="h-4 w-4" aria-hidden /> Media library
          </Link>
          <Link to="/releases" className={navLink} activeProps={active}>
            <History className="h-4 w-4" aria-hidden /> Releases
          </Link>
        </nav>
        {SIMULATED_SIGN_IN ? (
          <div className="mt-8 rounded-xl border border-dashed border-outline px-4 py-3 text-xs text-muted">
            <p className="font-semibold text-on-background">Local mode</p>
            <p className="mt-1">Sign-in is simulated. You're using the dashboard as:</p>
            <label htmlFor="local-role" className="sr-only">Role</label>
            <select
              id="local-role"
              value={role}
              onChange={(e) => changeRole(e.target.value as LocalRole)}
              className="mt-2 w-full rounded-full border border-outline bg-background px-3 py-1.5 text-sm text-on-background"
            >
              <option value="admin">Admin: can publish</option>
              <option value="editor">Editor: drafts only</option>
            </select>
          </div>
        ) : (
          <SignedInAs />
        )}
      </aside>
      <main className="px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
