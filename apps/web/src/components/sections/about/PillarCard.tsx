import type { LucideIcon } from 'lucide-react'

interface PillarCardProps {
  title: string
  icon: LucideIcon
  description: string
}

export default function PillarCard({ title, icon: Icon, description }: PillarCardProps) {
  return (
    <div className="group flex flex-col p-8 bg-surface border border-outline hover:border-primary/50 transition-colors rounded-2xl">
      <div className="w-12 h-12 flex items-center justify-center bg-surface-container text-primary border border-outline rounded-xl mb-8 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-sans text-xl font-black uppercase tracking-tight text-on-background mb-4">
        {title}
      </h3>
      <p className="font-sans text-sm text-on-background/60 leading-[1.6]">
        {description}
      </p>
    </div>
  )
}
