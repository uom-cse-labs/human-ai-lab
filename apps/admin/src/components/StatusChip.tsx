import type { PublishState } from '../lib/format.ts'

const STYLES: Record<PublishState, { label: string; className: string; hint: string }> = {
  live: { label: 'Live', className: 'bg-success-light text-success', hint: 'Visitors see this version' },
  changed: { label: 'Unpublished changes', className: 'bg-warning-light text-warning', hint: 'Edited since the last publish' },
  draft: { label: 'Draft', className: 'bg-surface-dim text-muted', hint: 'Not on the website yet' },
  hidden: { label: 'Hidden', className: 'bg-danger-light text-danger', hint: 'Left out of the next release' },
}

export default function StatusChip({ state }: { state: PublishState }) {
  const style = STYLES[state]
  return (
    <span title={style.hint} className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium ${style.className}`}>
      {style.label}
    </span>
  )
}
