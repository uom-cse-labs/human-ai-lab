import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { api } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import NewsRow from '../components/NewsRow.tsx'
import Notice from '../components/Notice.tsx'
import PublishPanel from '../components/PublishPanel.tsx'
import { publishState } from '../lib/format.ts'
import { useLoad } from '../lib/useLoad.ts'

export default function NewsListPage() {
  const { data, error, loading, reload } = useLoad(() => api.listNews())
  const items = data?.items ?? []
  const pending = items.filter((i) => ['draft', 'changed'].includes(publishState(i))).length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-sm text-muted">Articles on the website's News page and homepage.</p>
        </div>
        <Link to="/news/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          <Plus className="h-4 w-4" aria-hidden /> New article
        </Link>
      </header>

      {pending > 0 && (
        <Notice tone="warning">
          {pending === 1 ? '1 article has' : `${pending} articles have`} changes that visitors can't see yet. Publish to put them live.
        </Notice>
      )}

      <PublishPanel onPublished={() => void reload()} />

      {error && <ApiErrorNotice error={error} />}

      <section className="overflow-x-auto rounded-2xl border border-outline-variant bg-background px-5">
        <table className="w-full min-w-[40rem] text-left">
          <thead>
            <tr className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              <th className="py-3 pr-4 font-medium">Article</th>
              <th className="py-3 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">On the website</th>
              <th className="py-3 font-medium">Last saved</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => <NewsRow key={item.id} item={item} />)}
          </tbody>
        </table>
        {!loading && !error && items.length === 0 && (
          <p className="border-t border-outline-variant py-8 text-center text-sm text-muted">No articles yet. Create the first one.</p>
        )}
      </section>
    </div>
  )
}
