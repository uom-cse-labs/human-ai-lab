import { Link } from '@tanstack/react-router'
import type { ContentItem } from '../api/client.ts'
import type { CollectionDef } from '../collections.ts'
import { formatDateTime, publishState } from '../lib/format.ts'
import StatusChip from './StatusChip.tsx'

export default function CollectionRow({ collection, item }: { collection: CollectionDef; item: ContentItem }) {
  return (
    <tr className="border-t border-outline-variant align-top">
      <td className="py-3 pr-4">
        <Link
          to="/$section/$id"
          params={{ section: collection.path.slice(1), id: item.id }}
          className="font-semibold text-primary hover:underline"
        >
          {item.title}
        </Link>
      </td>
      {collection.columns.map((column) => (
        <td key={column.label} className="py-3 pr-4 text-sm">{column.value(item) || '—'}</td>
      ))}
      <td className="py-3 pr-4"><StatusChip state={publishState(item)} /></td>
      <td className="py-3 text-sm text-muted whitespace-nowrap">
        {formatDateTime(item.updatedAt)}
        <br />
        by {item.updatedBy}
      </td>
    </tr>
  )
}
