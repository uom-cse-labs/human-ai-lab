import type { MediaAsset } from '../api/client.ts'

export default function MediaTile({ asset, onChoose }: { asset: MediaAsset; onChoose: (asset: MediaAsset) => void }) {
  const described = Boolean(asset.altText)
  return (
    <button
      type="button"
      onClick={() => onChoose(asset)}
      className="group overflow-hidden rounded-xl border border-outline-variant bg-surface text-left hover:border-primary focus-visible:border-primary"
    >
      <img src={asset.thumbnailSrc} alt={asset.altText ?? ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
      <span className="block truncate px-2 py-1.5 text-xs">
        {described ? asset.altText : <span className="text-warning">Needs alt text · {asset.fileName}</span>}
      </span>
    </button>
  )
}
