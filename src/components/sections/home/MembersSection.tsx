import {
  TEAM_MEMBERS,
  FOUNDING_RAS,
  RESEARCH_ASSISTANTS,
  STUDENT_RESEARCHERS,
  ALUMNI,
} from "@/data";
import { Mail, Linkedin, GraduationCap } from "lucide-react";

interface MembersSectionProps {}

interface SocialLinksProps {
  socials?: {
    email?: string;
    linkedin?: string;
    scholar?: string;
  };
  size?: "md" | "sm";
}

function SocialLinks({ socials, size = "md" }: SocialLinksProps) {
  if (!socials || (!socials.email && !socials.linkedin && !socials.scholar))
    return null;
  const isSm = size === "sm";
  const btnClass = isSm
    ? "w-6 h-6 rounded-full bg-surface-dim hover:bg-primary/10 text-on-background/60 hover:text-primary border border-outline/10 flex items-center justify-center transition-colors"
    : "w-7 h-7 rounded-full bg-surface-dim hover:bg-primary/10 text-on-background/60 hover:text-primary border border-outline/20 flex items-center justify-center transition-colors";

  const iconSize = isSm ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div
      className={`flex items-center gap-1.5 ${isSm ? "mt-2" : "mt-3"}`}
    >
      {socials.email && (
        <a href={socials.email} className={btnClass} title="Email">
          <Mail className={iconSize} />
        </a>
      )}
      {socials.linkedin && (
        <a
          href={socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title="LinkedIn"
        >
          <Linkedin className={iconSize} />
        </a>
      )}
      {socials.scholar && (
        <a
          href={socials.scholar}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title="Google Scholar"
        >
          <GraduationCap className={iconSize} />
        </a>
      )}
    </div>
  );
}

export default function MembersSection({}: MembersSectionProps = {}) {
  const director = TEAM_MEMBERS[0];
  const faculty = TEAM_MEMBERS.slice(1);

  return (
    <section
      id="rounded-leadership"
      className="bg-background py-28 border-b border-outline"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-left mb-16">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
            PIONEERS & ADVISORS
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tight text-on-background mt-2 uppercase select-none">
            Research Leadership
          </h2>
        </div>

        {/* 1. Leadership (Prof. Indika Perera) */}
        {director && (
          <div className="mb-20">
            <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
              Leadership
            </h3>

            <div
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-surface border border-outline/50 rounded-3xl p-8 transition-all hover:border-primary/50"
            >
              {/* Photo: Left */}
              <div className="lg:col-span-3 relative aspect-[4/5] w-full overflow-hidden border border-outline rounded-2xl shadow-sm max-w-[280px] mx-auto lg:mx-0">
                <img
                  src={director.imageUrl}
                  alt={director.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 duration-700 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Bio & Details: Right */}
              <div className="lg:col-span-9 flex flex-col justify-between py-2">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <span className="inline-block bg-primary/10 text-primary font-mono text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20">
                      {director.title}
                    </span>
                  </div>
                  <h4 className="font-sans text-2xl lg:text-3xl font-black text-on-background group-hover:text-primary transition-colors uppercase tracking-tight mb-4">
                    {director.name}
                  </h4>

                  <p className="font-sans text-sm text-on-background/70 leading-[1.75] font-normal mb-6">
                    {director.bio}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
                  {/* Enlarged social icons for Director */}
                  <div
                    className="flex items-center gap-3 self-end md:self-auto shrink-0"
                  >
                    {director.socials?.email && (
                      <a
                        href={director.socials.email}
                        className="w-10 h-10 rounded-full bg-surface-dim hover:bg-primary/10 text-on-background/60 hover:text-primary border border-outline/30 flex items-center justify-center transition-colors"
                        title="Email"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                    {director.socials?.linkedin && (
                      <a
                        href={director.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-surface-dim hover:bg-primary/10 text-on-background/60 hover:text-primary border border-outline/30 flex items-center justify-center transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {director.socials?.scholar && (
                      <a
                        href={director.socials.scholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-surface-dim hover:bg-primary/10 text-on-background/60 hover:text-primary border border-outline/30 flex items-center justify-center transition-colors"
                        title="Google Scholar"
                      >
                        <GraduationCap className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Founding Faculty */}
        <div className="border-t border-outline/50 pt-16">
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
            Founding Faculty
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="group flex flex-col bg-surface border border-outline/30 rounded-3xl p-6 transition-all hover:border-primary/50"
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

                <h4 className="font-sans text-lg font-black text-on-background group-hover:text-primary transition-colors leading-snug uppercase tracking-tight">
                  {member.name}
                </h4>
                <p className="font-mono text-[9px] font-black text-primary tracking-[0.15em] uppercase mt-1.5 mb-1">
                  {member.title}
                </p>
                <SocialLinks socials={member.socials} />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Founding RAs */}
        <div className="border-t border-outline/50 pt-16 mt-16">
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
            Founding Research Assistants
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUNDING_RAS.map((ra) => (
              <div
                key={ra.id}
                className="group flex flex-col bg-surface border border-outline/20 rounded-2xl p-4 transition-all hover:border-primary/30"
              >
                <h4 className="font-sans text-sm font-black text-on-background group-hover:text-primary transition-colors leading-snug uppercase tracking-tight">
                  {ra.name}
                </h4>
                <p className="font-mono text-[8px] font-black text-primary tracking-[0.15em] uppercase mt-1 mb-1">
                  {ra.title}
                </p>
                <SocialLinks socials={ra.socials} />
                <p className="font-sans text-[11px] text-on-background/55 leading-relaxed mt-2.5">
                  {ra.expertise}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Research Assistants */}
        {RESEARCH_ASSISTANTS.length > 0 && (
          <div className="border-t border-outline/50 pt-16 mt-16">
            <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
              Research Assistants
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RESEARCH_ASSISTANTS.map((ra) => (
                <div
                  key={ra.id}
                  className="group flex flex-col bg-surface border border-outline/20 rounded-2xl p-4 transition-all hover:border-primary/30"
                >
                  <h4 className="font-sans text-sm font-black text-on-background group-hover:text-primary transition-colors leading-snug uppercase tracking-tight">
                    {ra.name}
                  </h4>
                  <p className="font-mono text-[8px] font-black text-primary tracking-[0.15em] uppercase mt-1 mb-1">
                    {ra.title}
                  </p>
                  <SocialLinks socials={ra.socials} />
                  {ra.expertise && (
                    <p className="font-sans text-[11px] text-on-background/55 leading-relaxed mt-2.5">
                      {ra.expertise}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Student Researchers */}
        <div className="border-t border-outline/50 pt-16 mt-16">
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
            Student Researchers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDENT_RESEARCHERS.map((student, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-surface/50 border border-outline/10 rounded-2xl"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-mono text-xs font-bold text-primary">
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                <div>
                  <h4 className="font-sans text-sm font-black text-on-background uppercase tracking-tight">
                    {student.name}
                  </h4>
                  <p className="font-mono text-[9px] font-black text-primary tracking-wider uppercase mt-0.5 mb-1">
                    {student.role}
                  </p>
                  {student.topic && (
                    <p className="font-sans text-xs text-on-background/60 leading-relaxed">
                      Focus: {student.topic}
                    </p>
                  )}
                  <SocialLinks socials={student.socials} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Alumni
        <div className="border-t border-outline/50 pt-16 mt-16">
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-8">
            Alumni
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALUMNI.map((alumnus, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-surface/50 border border-outline/10 rounded-2xl"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/5 border border-secondary/15 flex items-center justify-center font-mono text-xs font-bold text-secondary">
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                <div>
                  <h4 className="font-sans text-sm font-black text-on-background uppercase tracking-tight">
                    {alumnus.name}
                  </h4>
                  <p className="font-mono text-[9px] font-black text-secondary tracking-wider uppercase mt-0.5 mb-1">
                    {alumnus.role}
                  </p>
                  {alumnus.currentPosition && (
                    <p className="font-sans text-xs text-on-background/60 leading-relaxed">
                      Current: {alumnus.currentPosition}
                    </p>
                  )}
                  <SocialLinks socials={alumnus.socials} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
