import { TEAM_MEMBERS } from '@/data';
import type { TeamMember } from '@/types';
import TeamMemberCard from './TeamMemberCard';

interface MembersSectionProps {
  onSelectMember: (member: TeamMember) => void;
}

export default function MembersSection({ onSelectMember }: MembersSectionProps) {
  return (
    <section id="rounded-leadership" className="bg-background py-28 border-b border-outline">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
            PIONEERS & ADVISORS
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase select-none">
            Research Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.id} member={member} onSelect={onSelectMember} />
          ))}
        </div>

      </div>
    </section>
  );
}
