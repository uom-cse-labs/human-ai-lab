interface CollaborationPillProps {
  label: string
}

export default function CollaborationPill({ label }: CollaborationPillProps) {
  return (
    <span className="rounded-full border border-outline bg-surface-dim px-5 py-2.5 text-sm font-medium text-on-background/60 transition-colors duration-200 hover:border-primary/30 hover:bg-surface-container hover:text-primary">
      {label}
    </span>
  )
}
