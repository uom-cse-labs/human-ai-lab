import { TEAM_MEMBERS } from '@/data';
import type { TeamMember } from '@/types';

interface MembersSectionProps {
  onSelectMember: (member: TeamMember) => void;
}

export default function MembersSection({ onSelectMember }: MembersSectionProps) {
  return (
    <section id="rounded-leadership" className="bg-background py-28 border-b border-outline">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
            PIONEERS & ADVISORS
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase select-none">
            Research Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
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

      </div>
    </section>
  );
}
