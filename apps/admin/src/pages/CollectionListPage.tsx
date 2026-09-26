import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { api } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import CollectionRow from '../components/CollectionRow.tsx'
import Notice from '../components/Notice.tsx'
import PublishPanel from '../components/PublishPanel.tsx'
import type { CollectionDef } from '../collections.ts'
import { publishState } from '../lib/format.ts'
import { useLoad } from '../lib/useLoad.ts'

export default function CollectionListPage({ collection }: { collection: CollectionDef }) {
  const { data, error, loading, reload } = useLoad(() => api.content.list(collection.type), [collection.type])
  const items = [...(data?.items ?? [])].sort(collection.sort)
  const pending = items.filter((i) => ['draft', 'changed'].includes(publishState(i))).length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{collection.label}</h1>
          <p className="text-sm text-muted">{collection.description}</p>
        </div>
        <Link
          to="/$section/new"
          params={{ section: collection.path.slice(1) }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden /> New {collection.singular}
        </Link>
      </header>

      {pending > 0 && (
        <Notice tone="warning">
          {pending === 1 ? `1 ${collection.singular} has` : `${pending} ${collection.label.toLowerCase()} have`} changes that visitors can't see yet. Publish to put them live.
        </Notice>
      )}

      <PublishPanel onPublished={() => void reload()} />

      {error && <ApiErrorNotice error={error} />}

      <section className="overflow-x-auto rounded-2xl border border-outline-variant bg-background px-5">
        <table className="w-full min-w-[44rem] text-left">
          <thead>
            <tr className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              <th className="py-3 pr-4 font-medium">{collection.titleLabel}</th>
              {collection.columns.map((c) => <th key={c.label} className="py-3 pr-4 font-medium">{c.label}</th>)}
              <th className="py-3 pr-4 font-medium">On the website</th>
              <th className="py-3 font-medium">Last saved</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => <CollectionRow key={item.id} collection={collection} item={item} />)}
          </tbody>
        </table>
        {!loading && !error && items.length === 0 && (
          <p className="border-t border-outline-variant py-8 text-center text-sm text-muted">Nothing here yet.</p>
        )}
      </section>
    </div>
  )
}
