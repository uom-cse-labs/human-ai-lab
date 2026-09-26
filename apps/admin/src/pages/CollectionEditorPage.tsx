import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { api, ApiError, isAdmin, type ContentItem, type ContentItemInput } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import FormField from '../components/FormField.tsx'
import Notice from '../components/Notice.tsx'
import StatusChip from '../components/StatusChip.tsx'
import { CARD_STYLES, field, type CollectionDef, type FieldDef, type FormValues } from '../collections.ts'
import { publishState, slugify } from '../lib/format.ts'

const input = 'w-full rounded-xl border border-outline bg-background px-3 py-2 text-sm'

function toValues(collection: CollectionDef, item: ContentItem): FormValues {
  const values: FormValues = { title: item.title, slug: item.slug }
  for (const def of collection.fields) {
    if (def.target === 'summary') values[def.key] = item.summary ?? ''
    else if (def.target === 'body') values[def.key] = item.body ?? ''
    else if (def.kind === 'cardStyle') {
      values[def.key] = CARD_STYLES.find((s) => s.bgClass === field(item, 'bgClass'))?.value ?? CARD_STYLES[0].value
    } else values[def.key] = field(item, def.key)
  }
  return values
}

function toInput(collection: CollectionDef, values: FormValues, existing?: ContentItem): ContentItemInput {
  // Start from the stored fields so values this form doesn't edit are kept.
  const fields: Record<string, unknown> = { ...(existing?.fields ?? {}) }
  let summary: string | undefined
  let body: string | undefined
  for (const def of collection.fields) {
    const raw = (values[def.key] ?? '').trim()
    if (def.target === 'summary') summary = raw || undefined
    else if (def.target === 'body') body = raw
    else if (def.kind === 'cardStyle') {
      const style = CARD_STYLES.find((s) => s.value === raw) ?? CARD_STYLES[0]
      fields.bgClass = style.bgClass
      fields.textClass = style.textClass
    } else if (!raw) delete fields[def.key]
    else if (def.kind === 'number') fields[def.key] = Number(raw)
    else if (def.kind === 'lines') fields[def.key] = raw.split('\n').map((l) => l.trim()).filter(Boolean)
    else fields[def.key] = raw
  }
  return { title: values.title.trim(), slug: values.slug.trim(), summary, body, fields }
}

export default function CollectionEditorPage({ collection, id }: { collection: CollectionDef; id?: string }) {
  const navigate = useNavigate()
  const section = collection.path.slice(1)
  const [item, setItem] = useState<ContentItem>()
  const [values, setValues] = useState<FormValues>({ title: '', slug: '', ...collection.defaults })
  const [slugEdited, setSlugEdited] = useState(Boolean(id))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<Error>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    api.content.get(collection.type, id).then((loaded) => {
      setItem(loaded)
      setValues(toValues(collection, loaded))
    }, setError)
  }, [collection, id])

  function change(key: string, value: string) {
    setSaved(false)
    setValues((v) => ({ ...v, [key]: value, ...(key === 'title' && !slugEdited ? { slug: slugify(value) } : {}) }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      if (item) {
        setItem(await api.content.update(collection.type, item.id, item.version, toInput(collection, values, item)))
        setSaved(true)
      } else {
        const created = await api.content.create(collection.type, toInput(collection, values))
        await navigate({ to: '/$section/$id', params: { section, id: created.id } })
      }
    } catch (e) {
      setError(e as Error)
    } finally {
      setBusy(false)
    }
  }

  async function reloadLatest() {
    if (!item) return
    const latest = await api.content.get(collection.type, item.id)
    setItem(latest)
    setValues(toValues(collection, latest))
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
  const visible = (def: FieldDef) => !def.showWhen || def.showWhen(values)

  return (
    <form onSubmit={save} className="space-y-6">
      <Link to="/$section" params={{ section }} className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All {collection.label.toLowerCase()}
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{item ? `Edit ${collection.singular}` : `New ${collection.singular}`}</h1>
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
          <p className="mt-1">Your changes are still below. Copy anything you need, then load the latest version.</p>
          <button type="button" onClick={reloadLatest} className="mt-2 rounded-full border border-warning px-4 py-1 text-sm font-semibold">Load latest version</button>
        </Notice>
      )}
      {error && !conflict && <ApiErrorNotice error={error} />}

      <section className="grid gap-5 rounded-2xl border border-outline-variant bg-background p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="field-title" className="mb-1 block text-sm font-medium">{collection.titleLabel}</label>
          <input id="field-title" required maxLength={300} value={values.title} onChange={(e) => change('title', e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="field-slug" className="mb-1 block text-sm font-medium">Identifier</label>
          <input
            id="field-slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers and single hyphens"
            value={values.slug}
            onChange={(e) => { setSlugEdited(true); change('slug', e.target.value) }}
            className={`${input} font-mono`}
          />
          <p className="mt-1 text-xs text-muted">Must be unique. Filled in from the {collection.titleLabel.toLowerCase()} for new entries.</p>
        </div>
        {collection.fields.filter(visible).map((def) => <FormField key={def.key} def={def} values={values} onChange={change} />)}
      </section>

      {item && isAdmin() && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant bg-background p-5 text-sm">
          <span className="mr-auto text-muted">Admin actions</span>
          {state !== 'hidden' && state !== 'draft' && (
            <button type="button" onClick={() => run(() => api.content.unpublish(collection.type, item.id), () => void reloadLatest())} className="rounded-full border border-outline px-4 py-1.5 font-semibold">
              Hide from the website
            </button>
          )}
          {(state === 'draft' || state === 'hidden') && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full border border-danger px-4 py-1.5 font-semibold text-danger">Delete…</button>
          )}
          {confirmDelete && (
            <span className="flex items-center gap-2">
              Delete permanently?
              <button type="button" onClick={() => run(() => api.content.delete(collection.type, item.id), () => void navigate({ to: '/$section', params: { section } }))} className="rounded-full bg-danger px-4 py-1.5 font-semibold text-white">Delete</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-outline px-4 py-1.5 font-semibold">Cancel</button>
            </span>
          )}
        </section>
      )}
    </form>
  )
}
