import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { api, isAdmin, type Release } from '../api/client.ts'
import ApiErrorNotice from './ApiErrorNotice.tsx'
import Notice from './Notice.tsx'

/** Publishes everything that isn't hidden as a new release. Admins only (the API enforces this). */
export default function PublishPanel({ onPublished }: { onPublished?: (release: Release) => void }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [published, setPublished] = useState<Release>()

  if (!isAdmin()) {
    return (
      <section className="rounded-2xl border border-outline-variant bg-background p-5">
        <h2 className="text-base font-semibold">Publishing needs an admin</h2>
        <p className="mt-1 text-sm text-muted">
          You're using the dashboard as an <strong>editor</strong>. Your changes are saved as drafts and go live when an admin publishes.
          In local mode, switch to Admin at the bottom of the sidebar to publish.
        </p>
      </section>
    )
  }

  async function publish() {
    setBusy(true)
    setError(undefined)
    setPublished(undefined)
    try {
      const release = await api.publish(note.trim())
      setPublished(release)
      setNote('')
      onPublished?.(release)
    } catch (e) {
      setError(e as Error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-background p-5">
      <h2 className="text-base font-semibold">Publish the website</h2>
      <p className="mt-1 text-sm text-muted">
        Saves every item that isn't hidden as a new release. Visitors see it within about a minute, and you can roll back at any time.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <label htmlFor="publish-note" className="sr-only">Note for this release</label>
        <input
          id="publish-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="Note, e.g. “Added open day news”"
          className="min-w-0 flex-1 rounded-full border border-outline px-4 py-2 text-sm"
        />
        <button
          type="button"
          onClick={publish}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          <Rocket className="h-4 w-4" aria-hidden /> {busy ? 'Publishing…' : 'Publish'}
        </button>
      </div>
      <div className="mt-4 empty:hidden">
        {published && <Notice tone="success">Published. The website shows this release within about a minute.</Notice>}
        {error && <ApiErrorNotice error={error} />}
      </div>
    </section>
  )
}
