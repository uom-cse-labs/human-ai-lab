import { useState } from 'react'
import { ImageUp } from 'lucide-react'
import { api } from '../api/client.ts'
import ApiErrorNotice from '../components/ApiErrorNotice.tsx'
import LibraryCard from '../components/LibraryCard.tsx'
import MediaPicker from '../components/MediaPicker.tsx'
import { useLoad } from '../lib/useLoad.ts'

export default function MediaLibraryPage() {
  const { data, error, loading, reload } = useLoad(() => api.media.list())
  const [uploading, setUploading] = useState(false)
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media library</h1>
          <p className="text-sm text-muted">Every uploaded photo. Upload once, use it anywhere on the website.</p>
        </div>
        <button type="button" onClick={() => setUploading(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          <ImageUp className="h-4 w-4" aria-hidden /> Upload photo
        </button>
      </header>
      {error && <ApiErrorNotice error={error} />}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((asset) => <LibraryCard key={`${asset.id}-${asset.altText ?? ''}`} asset={asset} onChanged={() => void reload()} />)}
      </ul>
      {!loading && !error && items.length === 0 && <p className="py-8 text-center text-sm text-muted">No photos yet.</p>}
      {uploading && (
        <MediaPicker
          onClose={() => setUploading(false)}
          onChoose={() => {
            setUploading(false)
            void reload()
          }}
        />
      )}
    </div>
  )
}
