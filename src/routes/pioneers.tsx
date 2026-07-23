import { createFileRoute } from '@tanstack/react-router'
import { TEAM_MEMBERS } from '@/data'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/pioneers')({
  component: PioneersPage,
})

function PioneersPage() {
  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Hero Section */}
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-1/2 h-full bg-[#F27D26] blur-[150px] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col gap-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26] border border-[#F27D26]/30 bg-[#F27D26]/10 w-fit px-3 py-1 rounded-full">
            PIONEERS & ADVISORS
          </span>
          <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase max-w-5xl">
            Research Leadership
          </h1>
          <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mt-4">
            Meet the minds shaping the future of human-centered artificial intelligence. Our interdisciplinary team consists of leading researchers in cognitive modeling, ethical AI, and interactive systems.
          </p>
        </div>
      </section>

      {/* Roster Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {TEAM_MEMBERS.map((member, index) => {
          const isEven = index % 2 === 0;

          return (
            <div key={member.id} className="py-20 border-b border-outline last:border-b-0">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
                
                {/* Visual Side */}
                <div className="w-full lg:w-5/12">
                  <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden border border-outline shadow-2xl group">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center">
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="font-mono uppercase tracking-widest text-[#F27D26] border-[#F27D26]/30 bg-[#F27D26]/5">
                      {member.title}
                    </Badge>
                    <Badge variant="secondary" className="font-mono uppercase tracking-widest bg-surface-dim text-on-background/60">
                      {member.role}
                    </Badge>
                  </div>
                  
                  <h2 className="font-sans text-4xl md:text-6xl font-black tracking-tighter text-on-background uppercase mb-8 leading-[1]">
                    {member.name}
                  </h2>
                  
                  <div className="bg-surface p-6 md:p-8 border-l-2 border-[#F27D26] mb-8 rounded-2xl">
                    <p className="font-mono text-xs font-black text-on-background/40 uppercase tracking-[0.2em] mb-2">
                      Core Investigation Focus
                    </p>
                    <p className="font-sans text-xl text-on-background font-bold leading-relaxed">
                      {member.expertise}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-sans text-lg text-on-background/70 leading-[1.8] font-normal whitespace-pre-line">
                      {member.bio}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  )
}
