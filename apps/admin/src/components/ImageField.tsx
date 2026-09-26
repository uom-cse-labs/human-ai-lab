import { useState } from 'react'
import { ImageUp, Trash2 } from 'lucide-react'
import MediaPicker from './MediaPicker.tsx'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  help?: string
}

/** A photo on the website: upload or choose from the library; an external link still works as a fallback. */
export default function ImageField({ id, label, value, onChange, help }: Props) {
  const [picking, setPicking] = useState(false)
  const [showUrl, setShowUrl] = useState(Boolean(value) && !value.startsWith('/media/'))

  return (
    <div className="sm:col-span-2">
      <span id={`${id}-label`} className="mb-1 block text-sm font-medium">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-outline p-3">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-dim">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageUp className="h-7 w-7 text-muted" aria-hidden />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPicking(true)} aria-describedby={`${id}-label`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <ImageUp className="h-4 w-4" aria-hidden /> {value ? 'Change photo' : 'Upload or choose photo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-2 rounded-full border border-outline px-4 py-1.5 text-sm font-semibold">
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          )}
          <button type="button" onClick={() => setShowUrl((s) => !s)} className="rounded-full px-3 py-1.5 text-sm text-muted underline">
            {showUrl ? 'Hide link' : 'Use a link instead'}
          </button>
        </div>
      </div>
      {showUrl && (
        <input
          id={id}
          type="url"
          value={value.startsWith('/media/') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (an image hosted elsewhere)"
          className="mt-2 w-full rounded-xl border border-outline bg-background px-3 py-2 text-sm"
        />
      )}
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onChoose={(asset) => {
            onChange(asset.src ?? '')
            setShowUrl(false)
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}
