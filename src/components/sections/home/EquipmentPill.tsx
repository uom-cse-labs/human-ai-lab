interface EquipmentPillProps {
  label: string
}

export default function EquipmentPill({ label }: EquipmentPillProps) {
  return (
    <span className="rounded-full border border-outline bg-background px-5 py-3 text-sm text-on-background/60 transition-colors duration-200 hover:border-primary/30 hover:text-primary">
      {label}
    </span>
  )
}
