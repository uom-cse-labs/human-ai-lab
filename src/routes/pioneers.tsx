import { createFileRoute } from '@tanstack/react-router'
import { TEAM_MEMBERS } from '@/data'
import TeamMemberCard from '@/components/sections/home/TeamMemberCard'
import { useLab } from '@/lab-context'

export const Route = createFileRoute('/pioneers')({
  component: PioneersPage,
})

function PioneersPage() {
  const { setSelectedMember } = useLab()

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28 min-h-screen">
      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
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
          <TeamMemberCard key={member.id} member={member} onSelect={setSelectedMember} />
        ))}
      </div>
    </main>
  )
}
