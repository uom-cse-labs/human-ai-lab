import type { TeamMember } from "@/types";

interface PioneerCardProps {
  member: TeamMember;
}

export default function PioneerCard({ member }: PioneerCardProps) {
  return (
    <div className="group relative grid grid-rows-subgrid row-span-2 rounded-3xl border border-outline bg-surface overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full">
            {member.title}
          </span>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-surface-dim text-on-background/60 px-2.5 py-1 rounded-full">
            {member.role}
          </span>
        </div>

        <h3 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-on-background uppercase leading-[1.1] mb-4">
          {member.name}
        </h3>

        <div className="bg-background p-4 md:p-5 border-l-2 border-primary rounded-2xl mb-4">
          <p className="font-mono text-[10px] font-black text-on-background/40 uppercase tracking-[0.2em] mb-1.5">
            Core Investigation Focus
          </p>
          <p className="font-sans text-sm md:text-base text-on-background font-bold leading-relaxed">
            {member.expertise}
          </p>
        </div>

        {member.id === "member-1" && (
          <div className="mt-auto pt-2 border-t border-outline/50">
            <p className="font-sans text-sm text-on-background/70 leading-[1.7] font-normal whitespace-pre-line">
              {member.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
