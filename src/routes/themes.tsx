import { createFileRoute, Link } from '@tanstack/react-router'
import { FOCUS_AREAS } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Bot, Brain, Shield, Eye, Network } from 'lucide-react'

export const Route = createFileRoute('/themes')({
  component: Themes,
})

function Themes() {
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
        return <Network className={className} />
    }
  }

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Hero Section */}
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-1/2 h-full bg-[#F27D26] blur-[150px] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col gap-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26] border border-[#F27D26]/30 bg-[#F27D26]/10 w-fit px-3 py-1 rounded-full">
            EXPLORE OUR DOMAINS
          </span>
          <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase max-w-5xl">
            Intersecting technology with human behavior.
          </h1>
          <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mt-4">
            Our research operates at the boundaries of four core domains. Rather than studying these fields in isolation, we focus on the seams where they overlap, creating systems that are holistically integrated into human society.
          </p>
        </div>
      </section>

      {/* Detailed Themes Listing */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {FOCUS_AREAS.map((area, index) => {
          const isEven = index % 2 === 0;

          return (
            <div key={area.id} className="py-24 border-b border-outline last:border-b-0">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
                
                {/* Visual Side */}
                <div className="w-full lg:w-1/2">
                  {area.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-outline shadow-2xl group">
                      <img 
                        src={area.imageUrl} 
                        alt={area.title} 
                        className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#F27D26]/10 mix-blend-overlay transition-opacity group-hover:opacity-50" />
                    </div>
                  ) : (
                    <div className={`relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-outline flex items-center justify-center group ${area.bgClass}`}>
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                       <div className="bg-background/20 p-12 rounded-full backdrop-blur-md border border-black/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                          {renderIcon(area.iconName, `w-32 h-32 ${area.textClass}`)}
                       </div>
                    </div>
                  )}
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-surface-container text-[#F27D26] border border-outline rounded-xl">
                      {renderIcon(area.iconName, 'w-5 h-5')}
                    </div>
                    <Badge variant="outline" className="font-mono uppercase tracking-widest text-[#F27D26] border-[#F27D26]/30">
                      {area.type}
                    </Badge>
                  </div>
                  
                  <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase mb-6 leading-[1.1]">
                    {area.title}
                  </h2>
                  
                  <p className="font-sans text-xl text-on-background/80 font-medium leading-[1.6] mb-8 border-l-2 border-[#F27D26] pl-6 py-1">
                    {area.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    <p className="font-sans text-base text-on-background/60 leading-[1.8]">
                      {area.detailedDescription}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Outro */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-surface border border-outline p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F27D26]/5 mix-blend-overlay" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-sans text-3xl md:text-5xl font-black tracking-tighter text-on-background uppercase leading-[1.1] mb-6">
              Ready to dive deeper?
            </h2>
            <p className="font-sans text-lg text-on-background/60 mb-10">
              Explore our specific implementations of these themes in our peer-reviewed publications archive.
            </p>
            <Link to="/publications" className="inline-flex bg-[#F27D26] text-black font-sans font-black uppercase tracking-wider px-8 py-4 rounded-full hover:bg-white transition-colors">
              Read Our Publications
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
