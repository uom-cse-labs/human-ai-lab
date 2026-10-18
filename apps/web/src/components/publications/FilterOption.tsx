/** One choice in a filter group: a pill that is filled when selected. */
export default function FilterOption({ label, count, selected, onSelect }: {
  label: string
  count: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={
          selected
            ? 'inline-flex h-11 items-center gap-2 rounded-full bg-on-background px-4 text-sm font-bold text-background'
            : 'inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant px-4 text-sm font-bold text-on-background transition-colors hover:border-on-background'
        }
      >
        {label}
        <span className={selected ? 'font-mono text-xs text-background/70' : 'font-mono text-xs text-on-background/50'}>{count}</span>
      </button>
    </li>
  )
}
