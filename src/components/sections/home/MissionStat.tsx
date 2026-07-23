interface MissionStatProps {
  value: string
  label: string
}

export default function MissionStat({ value, label }: MissionStatProps) {
  return (
    <div className="flex flex-col">
      <span className="font-sans text-5xl md:text-6xl font-black text-primary tracking-tighter">
        {value}
      </span>
      <span className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] mt-2 uppercase">
        {label}
      </span>
    </div>
  )
}
