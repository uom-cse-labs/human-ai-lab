/** A pill linking to a section further down the People page. */
export default function JumpLink({ id, label, count }: { id: string; label: string; count: number }) {
  return (
    <li>
      <a
        href={`#${id}`}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant bg-background px-5 font-sans text-sm font-bold text-on-background transition-colors hover:border-on-background"
      >
        {label}
        <span className="font-mono text-xs text-on-background/50">{count}</span>
      </a>
    </li>
  )
}
