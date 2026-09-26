import { useState } from 'react'
import { isAdmin, type Release } from '../api/client.ts'
import { formatDateTime } from '../lib/format.ts'

export default function ReleaseRow({ release, onRestore }: { release: Release; onRestore: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <li className="flex flex-wrap items-center gap-3 border-t border-outline-variant py-3 first:border-t-0">
      <div className="mr-auto">
        <p className="font-semibold">{release.note || 'No note'}</p>
        <p className="text-sm text-muted">{formatDateTime(release.publishedAt)} · by {release.publishedBy}</p>
      </div>
      {release.isCurrent ? (
        <span className="rounded-full bg-success-light px-3 py-1 font-mono text-[11px] font-medium text-success">On the website</span>
      ) : !isAdmin() ? null : confirming ? (
        <span className="flex items-center gap-2 text-sm">
          Put this version back on the website?
          <button type="button" onClick={() => onRestore(release.id)} className="rounded-full bg-primary px-4 py-1.5 font-semibold text-white">Roll back</button>
          <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-outline px-4 py-1.5 font-semibold">Cancel</button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="rounded-full border border-outline px-4 py-1.5 text-sm font-semibold">
          Roll back to this…
        </button>
      )}
    </li>
  )
}
