import { createFileRoute } from '@tanstack/react-router'
import { NEWS } from '@/data'
import { useLab } from '@/lab-context'

export const Route = createFileRoute('/dispatches')({
  component: DispatchesPage,
})

function DispatchesPage() {
  const { setSelectedNews } = useLab()

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28 min-h-screen">
      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
          LABORATORY DISPATCHES
        </span>
        <h1 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 mb-4 uppercase select-none">
          News from the Lab
        </h1>
        <p className="font-sans text-base text-on-background/60 leading-[1.6] font-normal max-w-2xl">
          Stay updated on the latest research breakthroughs, team announcements, conference attendances, and media features surrounding the AIM Lab.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {NEWS.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedNews(item)}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden mb-6 border border-outline bg-surface rounded-2xl">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 filter grayscale contrast-110 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#F27D26]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </div>

            <span className="font-mono text-[10px] font-black text-[#F27D26] tracking-[0.2em] uppercase mb-3">
              {item.date}
            </span>

            <h3 className="font-sans text-xl font-black text-on-background group-hover:text-[#F27D26] transition-colors mb-3 tracking-tight leading-snug uppercase line-clamp-2">
              {item.title}
            </h3>

            <p className="font-sans text-sm text-on-background/60 leading-[1.6] font-normal line-clamp-3">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
