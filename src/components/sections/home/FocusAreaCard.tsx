import type { FocusArea } from '@/types'
import { Bot, Brain, Shield, Eye, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FocusAreaCardProps {
  area: FocusArea
  onSelect: (area: FocusArea) => void
}

const iconMap = {
  robot: Bot,
  brain: Brain,
  shield: Shield,
  eye: Eye,
} as const

export default function FocusAreaCard({ area, onSelect }: FocusAreaCardProps) {
  const isImageBg = !!area.imageUrl

  if (isImageBg) {
    return (
      <div
        key={area.id}
        onClick={() => onSelect(area)}
        className="group relative h-[420px] cursor-pointer overflow-hidden border border-outline transition-colors duration-300 hover:border-on-background/20 rounded-2xl"
      >
        <img
          src={area.imageUrl}
          alt={area.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-[0.35]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay/95 via-overlay/45 to-transparent rounded-2xl" />

        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
          <Badge className="mb-4 max-w-fit bg-black/40 text-white backdrop-blur-md hover:bg-black/60 border border-white/20">
            {area.type}
          </Badge>
          <h3 className="font-sans text-2xl font-black tracking-tight mb-2 group-hover:text-white/90 transition-colors uppercase">
            {area.title}
          </h3>
          <p className="font-sans text-sm text-white/80 leading-[1.6] max-w-xl font-normal drop-shadow-sm">
            {area.description}
          </p>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    )
  }

  const Icon = iconMap[area.iconName]

  return (
    <div
      key={area.id}
      onClick={() => onSelect(area)}
      className="group bg-surface hover:bg-surface-dim p-8 flex flex-col justify-between h-[420px] border border-outline cursor-pointer hover:border-primary/40 transition-all duration-300 rounded-2xl"
    >
      <div>
        <div className="w-14 h-14 flex items-center justify-center bg-surface-container text-primary border border-outline mb-8 transition-colors group-hover:border-primary/40 rounded-2xl">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-sans text-2xl font-black tracking-tight mb-3 text-on-background uppercase">
          {area.title}
        </h3>
        <p className="font-sans text-sm leading-[1.6] text-on-background/60 font-normal">
          {area.description}
        </p>
      </div>

      <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary group-hover:text-white mt-6 inline-flex items-center gap-1.5 transition-colors">
        EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  )
}
