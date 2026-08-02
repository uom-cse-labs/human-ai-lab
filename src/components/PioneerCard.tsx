import type { TeamMember } from "@/types";
import { Mail, Linkedin, GraduationCap } from "lucide-react";

interface PioneerCardProps {
  member: TeamMember;
}

export default function PioneerCard({ member }: PioneerCardProps) {
  return (
    <div className="group relative flex flex-col rounded-3xl border border-outline bg-surface overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full">
            {member.title}
          </span>
        </div>

        <h3 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-on-background uppercase leading-[1.1] mb-4">
          {member.name}
        </h3>

        {member.id === "member-1" && (
          <div className="mt-auto pt-2 border-t border-outline/50">
            <p className="font-sans text-sm text-on-background/70 leading-[1.7] font-normal whitespace-pre-line">
              {member.bio}
            </p>
          </div>
        )}

        {member.socials && (
          <div className="flex gap-4 mt-auto pt-4">
            {member.socials.email && (
              <a href={member.socials.email} className="text-on-background/60 hover:text-primary transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            )}
            {member.socials.linkedin && (
              <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-on-background/60 hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {member.socials.scholar && (
              <a href={member.socials.scholar} target="_blank" rel="noopener noreferrer" className="text-on-background/60 hover:text-primary transition-colors" aria-label="Google Scholar">
                <GraduationCap className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
