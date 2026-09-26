import { useState } from 'react'
import { api, isAdmin, type MediaAsset } from '../api/client.ts'
import ApiErrorNotice from './ApiErrorNotice.tsx'

export default function LibraryCard({ asset, onChanged }: { asset: MediaAsset; onChanged: () => void }) {
  const [altText, setAltText] = useState(asset.altText ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<Error>()
  const [usedBy, setUsedBy] = useState<number>()
  const [confirming, setConfirming] = useState(false)
  const inputId = `alt-${asset.id}`

  async function save() {
    setError(undefined)
    try {
      await api.media.describe(asset.id, altText.trim())
      setSaved(true)
      onChanged()
    } catch (e) {
      setError(e as Error)
    }
  }

  async function askDelete() {
    setUsedBy((await api.media.usage(asset.id)).length)
    setConfirming(true)
  }

  async function remove() {
    setError(undefined)
    try {
      await api.media.delete(asset.id)
      onChanged()
    } catch (e) {
      setError(e as Error)
      setConfirming(false)
    }
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background">
      {asset.status === 'ready' ? (
        <img src={asset.thumbnailSrc} alt={asset.altText ?? ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-surface-dim p-4 text-center text-sm text-danger">
          {asset.status === 'failed' ? asset.failureReason : `Status: ${asset.status}`}
        </div>
      )}
      <div className="space-y-2 p-3 text-sm">
        <p className="truncate font-mono text-xs text-muted" title={asset.fileName}>
          {asset.fileName} · {asset.width}×{asset.height}
        </p>
        <label htmlFor={inputId} className="block text-xs font-medium">Alt text</label>
        <div className="flex gap-2">
          <input id={inputId} value={altText} maxLength={500} onChange={(e) => { setAltText(e.target.value); setSaved(false) }} className="min-w-0 flex-1 rounded-lg border border-outline px-2 py-1 text-sm" placeholder="Describe the photo" />
          <button type="button" onClick={save} disabled={!altText.trim() || altText === (asset.altText ?? '')} className="rounded-full border border-outline px-3 text-xs font-semibold disabled:opacity-40">Save</button>
        </div>
        {saved && <p className="text-xs text-success">Saved.</p>}
        {!asset.altText && !saved && <p className="text-xs text-warning">Needs alt text before it can be published.</p>}
        {error && <ApiErrorNotice error={error} />}
        {isAdmin() && (
          confirming ? (
            usedBy ? (
              <p className="text-xs text-danger">Used by {usedBy} item(s). Remove it from them before deleting. <button type="button" onClick={() => setConfirming(false)} className="underline">OK</button></p>
            ) : (
              <p className="flex items-center gap-2 text-xs">Delete this photo?
                <button type="button" onClick={remove} className="rounded-full bg-danger px-3 py-1 font-semibold text-white">Delete</button>
                <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-outline px-3 py-1 font-semibold">Cancel</button>
              </p>
            )
          ) : (
            <button type="button" onClick={askDelete} className="text-xs text-danger underline">Delete…</button>
          )
        )}
      </div>
    </li>
  )
}
