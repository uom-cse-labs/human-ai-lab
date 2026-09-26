import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import Markdown from 'react-markdown'
import { api, ApiError, isAdmin, type ContentItem, type ContentItemInput } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import Notice from '../components/Notice.tsx'
import StatusChip from '../components/StatusChip.tsx'
import { publishState, slugify, stringField } from '../lib/format.ts'

interface Form {
  title: string
  slug: string
  date: string
  summary: string
  imageUrl: string
  body: string
}

const EMPTY: Form = { title: '', slug: '', date: new Date().toISOString().slice(0, 10), summary: '', imageUrl: '', body: '' }

function toForm(item: ContentItem): Form {
  return {
    title: item.title,
    slug: item.slug,
    date: stringField(item, 'date'),
    summary: item.summary ?? '',
    imageUrl: stringField(item, 'imageUrl'),
    body: item.body ?? '',
  }
}

function toInput(form: Form): ContentItemInput {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim() || undefined,
    body: form.body,
    fields: { date: form.date, ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}) },
  }
}

const input = 'w-full rounded-xl border border-outline bg-background px-3 py-2 text-sm'
const label = 'mb-1 block text-sm font-medium'

export default function NewsEditorPage({ id }: { id?: string }) {
  const navigate = useNavigate()
  const [item, setItem] = useState<ContentItem>()
  const [form, setForm] = useState<Form>(EMPTY)
  const [slugEdited, setSlugEdited] = useState(Boolean(id))
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<Error>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    api.getNews(id).then((loaded) => {
      setItem(loaded)
      setForm(toForm(loaded))
    }, setError)
  }, [id])

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: value, ...(key === 'title' && !slugEdited ? { slug: slugify(String(value)) } : {}) }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      if (item) {
        const updated = await api.updateNews(item.id, item.version, toInput(form))
        setItem(updated)
        setSaved(true)
      } else {
        const created = await api.createNews(toInput(form))
        await navigate({ to: '/news/$id', params: { id: created.id } })
      }
    } catch (e) {
      setError(e as Error)
    } finally {
      setBusy(false)
    }
  }

  async function reloadLatest() {
    if (!item) return
    const latest = await api.getNews(item.id)
    setItem(latest)
    setForm(toForm(latest))
    setError(undefined)
  }

  async function run(action: () => Promise<unknown>, after: () => void) {
    setError(undefined)
    try {
      await action()
      after()
    } catch (e) {
      setError(e as Error)
    }
  }

  const conflict = error instanceof ApiError && error.code === 'VERSION_CONFLICT'
  const state = item ? publishState(item) : 'draft'

  return (
    <form onSubmit={save} className="space-y-6">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All news
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{item ? 'Edit article' : 'New article'}</h1>
          {item && <StatusChip state={state} />}
        </div>
        <button type="submit" disabled={busy} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60">
          {busy ? 'Saving…' : item ? 'Save' : 'Create draft'}
        </button>
      </header>

      {saved && <Notice tone="success">Saved (version {item?.version}). Visitors see it after the next publish.</Notice>}
      {conflict && (
        <Notice tone="warning">
          <p className="font-medium">{error.message}</p>
          <p className="mt-1">Your text is still below. Copy anything you need, then load the latest version.</p>
          <button type="button" onClick={reloadLatest} className="mt-2 rounded-full border border-warning px-4 py-1 text-sm font-semibold">
            Load latest version
          </button>
        </Notice>
      )}
      {error && !conflict && <ApiErrorNotice error={error} />}

      <section className="grid gap-5 rounded-2xl border border-outline-variant bg-background p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={label}>Title</label>
          <input id="title" required maxLength={300} value={form.title} onChange={(e) => update('title', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="slug" className={label}>Web address</label>
          <div className="flex items-center rounded-xl border border-outline bg-background pl-3 text-sm">
            <span className="font-mono text-muted">/news/</span>
            <input
              id="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Lowercase letters, numbers and single hyphens"
              value={form.slug}
              onChange={(e) => { setSlugEdited(true); update('slug', e.target.value) }}
              className="min-w-0 flex-1 rounded-r-xl px-1 py-2 font-mono"
            />
          </div>
        </div>
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" type="date" required value={form.date} onChange={(e) => update('date', e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="summary" className={label}>Summary</label>
          <textarea id="summary" rows={2} maxLength={1000} value={form.summary} onChange={(e) => update('summary', e.target.value)} className={input} />
          <p className="mt-1 text-xs text-muted">Shown on news cards and under the headline.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="imageUrl" className={label}>Cover image URL</label>
          <input id="imageUrl" type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className={input} placeholder="https://…" />
          <p className="mt-1 text-xs text-muted">Uploading from the media library arrives in a later release of the dashboard.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-background p-5">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="body" className="text-sm font-medium">Article (Markdown)</label>
          <div className="flex rounded-full border border-outline p-0.5 text-xs font-semibold" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')} className={`rounded-full px-3 py-1 ${tab === 'write' ? 'bg-primary text-white' : ''}`}>Write</button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')} className={`rounded-full px-3 py-1 ${tab === 'preview' ? 'bg-primary text-white' : ''}`}>Preview</button>
          </div>
        </div>
        {tab === 'write' ? (
          <textarea id="body" rows={16} value={form.body} onChange={(e) => update('body', e.target.value)} className={`${input} font-mono`} />
        ) : (
          <div className="prose max-w-none rounded-xl border border-outline-variant p-4">
            <Markdown skipHtml>{form.body || '*Nothing to preview yet.*'}</Markdown>
          </div>
        )}
      </section>

      {item && isAdmin() && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant bg-background p-5 text-sm">
          <span className="mr-auto text-muted">Admin actions</span>
          {state !== 'hidden' && state !== 'draft' && (
            <button type="button" onClick={() => run(() => api.unpublishNews(item.id), () => void reloadLatest())} className="rounded-full border border-outline px-4 py-1.5 font-semibold">
              Hide from the website
            </button>
          )}
          {(state === 'draft' || state === 'hidden') && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full border border-danger px-4 py-1.5 font-semibold text-danger">
              Delete…
            </button>
          )}
          {confirmDelete && (
            <span className="flex items-center gap-2">
              Delete this article permanently?
              <button type="button" onClick={() => run(() => api.deleteNews(item.id), () => void navigate({ to: '/news' }))} className="rounded-full bg-danger px-4 py-1.5 font-semibold text-white">Delete</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-outline px-4 py-1.5 font-semibold">Cancel</button>
            </span>
          )}
        </section>
      )}
    </form>
  )
}
