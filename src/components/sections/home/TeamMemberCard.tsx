import type { TeamMember } from '@/types'

interface TeamMemberCardProps {
  member: TeamMember
  onSelect: (member: TeamMember) => void
}

export default function TeamMemberCard({ member, onSelect }: TeamMemberCardProps) {
  return (
    <div
      key={member.id}
      onClick={() => onSelect(member)}
      className="group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden mb-6 rounded-2xl border border-outline shadow-sm">
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 duration-700 group-hover:opacity-100 transition-opacity" />
      </div>

      <h3 className="font-sans text-lg font-black text-on-background group-hover:text-primary transition-colors leading-snug uppercase tracking-tight">
        {member.name}
      </h3>
      <p className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mt-1 mb-3">
        {member.title}
      </p>
      <p className="font-sans text-xs text-on-background/60 leading-[1.6] font-normal">
        {member.expertise}
      </p>
    </div>
  )
}
