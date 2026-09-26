import { useEffect, useRef, useState } from 'react'
import { ImageUp, X } from 'lucide-react'
import { api, type MediaAsset } from '../api/client.ts'
import { ACCEPTED_IMAGES } from '../lib/media.ts'
import ApiErrorNotice from './ApiErrorNotice.tsx'
import MediaTile from './MediaTile.tsx'

/**
 * Upload a new photo or choose one from the media library. Alt text is required: it describes the photo to
 * people using screen readers, and the website can't publish photos without it.
 */
export default function MediaPicker({ onChoose, onClose }: { onChoose: (asset: MediaAsset) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'upload' | 'library'>('upload')
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState<string>()
  const [altText, setAltText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error>()
  const [library, setLibrary] = useState<MediaAsset[]>()
  const [pending, setPending] = useState<MediaAsset>()
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  useEffect(() => {
    if (tab === 'library' && !library) {
      api.media.list().then((page) => setLibrary(page.items.filter((m) => m.status === 'ready' && m.kind === 'image')), setError)
    }
  }, [tab, library])

  useEffect(() => {
    if (!file) return setPreview(undefined)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function upload() {
    if (!file) return
    setBusy(true)
    setError(undefined)
    try {
      onChoose(await api.media.upload(file, altText))
    } catch (e) {
      setError(e as Error)
    } finally {
      setBusy(false)
    }
  }

  /** A library photo without alt text gets it here before it can be used. */
  async function choose(asset: MediaAsset) {
    if (asset.altText) return onChoose(asset)
    setPending(asset)
    setAltText('')
  }

  async function describeAndChoose() {
    if (!pending) return
    setBusy(true)
    try {
      onChoose(await api.media.describe(pending.id, altText.trim()))
    } catch (e) {
      setError(e as Error)
    } finally {
      setBusy(false)
    }
  }

  const tabClass = (active: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? 'bg-primary text-white' : 'text-muted'}`
  const input = 'w-full rounded-xl border border-outline bg-background px-3 py-2 text-sm'

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="media-picker-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl border border-outline-variant bg-background p-0 text-on-background backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between border-b border-outline-variant px-5 py-3">
        <h2 id="media-picker-title" className="font-semibold">Add a photo</h2>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="rounded-full p-1.5 hover:bg-surface-dim">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex gap-1 rounded-full border border-outline p-0.5 w-fit" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'upload'} onClick={() => setTab('upload')} className={tabClass(tab === 'upload')}>Upload new</button>
          <button type="button" role="tab" aria-selected={tab === 'library'} onClick={() => setTab('library')} className={tabClass(tab === 'library')}>Media library</button>
        </div>

        {error && <ApiErrorNotice error={error} />}

        {tab === 'upload' ? (
          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <label htmlFor="media-file" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-outline bg-surface text-sm text-muted hover:border-primary">
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <><ImageUp className="h-8 w-8" aria-hidden /> Choose a photo</>}
            </label>
            <input id="media-file" type="file" accept={ACCEPTED_IMAGES} className="sr-only" onChange={(e) => setFile(e.target.files?.[0])} />
            <div className="space-y-3">
              <p className="text-sm text-muted">JPEG, PNG or WebP, up to 25 MB. Photos are resized for the web, and location and camera data is removed.</p>
              <div>
                <label htmlFor="media-alt" className="mb-1 block text-sm font-medium">Alt text</label>
                <input id="media-alt" value={altText} maxLength={500} onChange={(e) => setAltText(e.target.value)} className={input} placeholder="e.g. Students testing the robotic arm in the lab" />
                <p className="mt-1 text-xs text-muted">Describe what's in the photo for people who can't see it.</p>
              </div>
              <button type="button" onClick={upload} disabled={!file || !altText.trim() || busy} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                {busy ? 'Uploading…' : 'Upload and use'}
              </button>
            </div>
          </div>
        ) : pending ? (
          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <img src={pending.thumbnailSrc} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
            <div className="space-y-3">
              <label htmlFor="media-pending-alt" className="block text-sm font-medium">This photo needs alt text before it can be used</label>
              <input id="media-pending-alt" value={altText} maxLength={500} onChange={(e) => setAltText(e.target.value)} className={input} />
              <div className="flex gap-2">
                <button type="button" onClick={describeAndChoose} disabled={!altText.trim() || busy} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Save and use</button>
                <button type="button" onClick={() => setPending(undefined)} className="rounded-full border border-outline px-5 py-2 text-sm font-semibold">Back</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
            {(library ?? []).map((asset) => <MediaTile key={asset.id} asset={asset} onChoose={choose} />)}
            {library && library.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted">No photos yet. Upload one first.</p>}
          </div>
        )}
      </div>
    </dialog>
  )
}
