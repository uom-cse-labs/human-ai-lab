import { createFileRoute } from '@tanstack/react-router'
import { FOCUS_AREAS } from '@/data'
import FocusAreaCard from '@/components/sections/home/FocusAreaCard'
import { useLab } from '@/lab-context'
import type { FocusArea } from '@/types'

export const Route = createFileRoute('/themes')({
  component: Themes,
})

function Themes() {
  const { setSelectedFocusArea } = useLab()

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

          return (
            <div key={area.id} className={colSpan}>
              <FocusAreaCard area={area} onSelect={handleSelectArea} />
            </div>
          )
        })}
      </div>
    </main>
  )
}
