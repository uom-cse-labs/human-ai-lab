import { createFileRoute } from '@tanstack/react-router'
import { NEWS } from '@/data'
import NewsCard from '@/components/sections/home/NewsCard'
import { useLab } from '@/lab-context'

export const Route = createFileRoute('/dispatches')({
  component: DispatchesPage,
})

function DispatchesPage() {
  const { setSelectedNews } = useLab()

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28 min-h-screen">
      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
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
          <NewsCard key={item.id} item={item} onSelect={setSelectedNews} />
        ))}
      </div>
    </main>
  )
}
