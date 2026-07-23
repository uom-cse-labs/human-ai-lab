import { createFileRoute } from '@tanstack/react-router'
import { TEAM_MEMBERS } from '@/data'
import { useLab } from '@/lab-context'

export const Route = createFileRoute('/pioneers')({
  component: PioneersPage,
})

function PioneersPage() {
  const { setSelectedMember } = useLab()

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28 min-h-screen">
      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
          PIONEERS & ADVISORS
        </span>
        <h1 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 mb-4 uppercase select-none">
          Research Leadership
        </h1>
        <p className="font-sans text-base text-on-background/60 leading-[1.6] font-normal max-w-2xl">
          Meet the minds shaping the future of human-centered artificial intelligence. Our interdisciplinary team consists of leading researchers in cognitive modeling, ethical AI, and interactive systems.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden mb-6 border border-outline bg-surface rounded-2xl">
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 grayscale contrast-[1.1] brightness-90 group-hover:grayscale-0 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#F27D26]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </div>

            <h3 className="font-sans text-lg font-black text-on-background group-hover:text-[#F27D26] transition-colors leading-snug uppercase tracking-tight">
              {member.name}
            </h3>
            <p className="font-mono text-[10px] font-black text-[#F27D26] tracking-[0.2em] uppercase mt-1 mb-3">
              {member.title}
            </p>
            <p className="font-sans text-xs text-on-background/60 leading-[1.6] font-normal">
              {member.expertise}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
