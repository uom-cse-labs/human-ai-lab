import { useState } from 'react'
import { api } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import Notice from '../components/Notice.tsx'
import PublishPanel from '../components/PublishPanel.tsx'
import ReleaseRow from '../components/ReleaseRow.tsx'
import { useLoad } from '../lib/useLoad.ts'

export default function ReleasesPage() {
  const { data, error, reload } = useLoad(() => api.listReleases())
  const [actionError, setActionError] = useState<Error>()
  const [restored, setRestored] = useState(false)

  async function restore(id: string) {
    setActionError(undefined)
    setRestored(false)
    try {
      await api.restoreRelease(id)
      setRestored(true)
      await reload()
    } catch (e) {
      setActionError(e as Error)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Releases</h1>
        <p className="text-sm text-muted">Every publish is saved. Rolling back switches the website to an earlier release in seconds; drafts are not changed.</p>
      </header>
      <PublishPanel onPublished={() => void reload()} />
      {restored && <Notice tone="success">Rolled back. The website shows that release within about a minute.</Notice>}
      {(error ?? actionError) && <ApiErrorNotice error={(error ?? actionError)!} />}
      <ul className="rounded-2xl border border-outline-variant bg-background px-5">
        {(data?.items ?? []).map((release) => <ReleaseRow key={release.id} release={release} onRestore={restore} />)}
      </ul>
    </div>
  )
}
