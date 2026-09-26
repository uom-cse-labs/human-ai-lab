import { Link } from '@tanstack/react-router'
import type { ContentItem } from '../api/client.ts'
import { formatDate, formatDateTime, publishState, stringField } from '../lib/format.ts'
import StatusChip from './StatusChip.tsx'

export default function NewsRow({ item }: { item: ContentItem }) {
  return (
    <tr className="border-t border-outline-variant align-top">
      <td className="py-3 pr-4">
        <Link to="/news/$id" params={{ id: item.id }} className="font-semibold text-primary hover:underline">
          {item.title}
        </Link>
        <p className="font-mono text-xs text-muted">/news/{item.slug}</p>
      </td>
      <td className="py-3 pr-4 text-sm whitespace-nowrap">{formatDate(stringField(item, 'date'))}</td>
      <td className="py-3 pr-4"><StatusChip state={publishState(item)} /></td>
      <td className="py-3 text-sm text-muted whitespace-nowrap">
        {formatDateTime(item.updatedAt)}
        <br />
        by {item.updatedBy}
      </td>
    </tr>
  )
}
