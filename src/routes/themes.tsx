import { createFileRoute } from '@tanstack/react-router'
import { FOCUS_AREAS } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Bot, Brain, Shield, Eye, ArrowRight } from 'lucide-react'
import { useLab } from '@/lab-context'
import type { FocusArea } from '@/types'

export const Route = createFileRoute('/themes')({
  component: Themes,
})

function Themes() {
  const { setSelectedFocusArea } = useLab()

  const renderIcon = (name: string, className: string) => {
    switch (name) {
      case 'robot':
        return <Bot className={className} />
      case 'brain':
        return <Brain className={className} />
      case 'shield':
        return <Shield className={className} />
      case 'eye':
        return <Eye className={className} />
      default:
        return <Bot className={className} />
    }
  }

  const handleSelectArea = (area: FocusArea) => {
    setSelectedFocusArea(area)
  }

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28 min-h-screen">
      <h1 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase mb-16">
        Research Themes
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {FOCUS_AREAS.map((area, index) => {
          const colSpan = (index === 0 || index === 3)
            ? 'lg:col-span-8 md:col-span-2'
            : 'lg:col-span-4 md:col-span-1'

          const isImageBg = !!area.imageUrl

          if (isImageBg) {
            return (
              <div
                key={area.id}
                onClick={() => handleSelectArea(area)}
                className={`group relative ${colSpan} h-[420px] cursor-pointer overflow-hidden border border-outline transition-colors duration-300 hover:border-on-background/20 rounded-2xl`}
              >
                <img
                  src={area.imageUrl}
                  alt={area.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-[0.35]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/45 to-transparent rounded-2xl" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                  <div className="mb-4">
                    <Badge>{area.type}</Badge>
                  </div>
                  <h3 className="font-sans text-2xl font-black tracking-tight mb-2 group-hover:text-[#F27D26] transition-colors uppercase">
                    {area.title}
                  </h3>
                  <p className="font-sans text-sm text-white/60 leading-[1.6] max-w-xl font-normal">
                    {area.description}
                  </p>
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26] mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={area.id}
              onClick={() => handleSelectArea(area)}
              className={`group ${colSpan} bg-surface hover:bg-surface-dim p-8 flex flex-col justify-between h-[420px] border border-outline cursor-pointer hover:border-[#F27D26]/40 transition-all duration-300 rounded-2xl`}
            >
              <div>
                <div className="w-14 h-14 flex items-center justify-center bg-surface-container text-[#F27D26] border border-outline mb-8 transition-colors group-hover:border-[#F27D26]/40 rounded-2xl">
                  {renderIcon(area.iconName, 'w-6 h-6')}
                </div>
                <h3 className="font-sans text-2xl font-black tracking-tight mb-3 text-on-background uppercase">
                  {area.title}
                </h3>
                <p className="font-sans text-sm leading-[1.6] text-on-background/60 font-normal">
                  {area.description}
                </p>
              </div>

              <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26] group-hover:text-white mt-6 inline-flex items-center gap-1.5 transition-colors">
                EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
