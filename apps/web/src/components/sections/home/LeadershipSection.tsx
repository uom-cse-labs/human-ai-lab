import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { usePeopleDirectory } from "@/lib/content";
import TeamAvatar from "./TeamAvatar";

/**
 * A short introduction to the people behind the lab: the director, and a link to everyone on the People
 * page. The full directory lives there so the home and About pages stay short.
 */
export default function LeadershipSection() {
  const { directory } = usePeopleDirectory();
  const { director, faculty, fellows, postgraduates, assistants, currentCount } = directory;
  if (!director) {
    return null;
  }
  const team = [...faculty, ...fellows, ...postgraduates, ...assistants].filter((m) => m.imageUrl);

  return (
    <section id="rounded-leadership" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-10">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
          People
        </span>
        <h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-on-background md:text-4xl">
          Research leadership
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 rounded-3xl border border-outline-variant bg-surface p-6 sm:p-8 md:grid-cols-12 md:items-center">
        <img
          src={director.imageUrl}
          alt={director.name}
          className="aspect-square w-32 rounded-2xl object-cover grayscale md:col-span-3 md:w-full"
        />
        <div className="md:col-span-9">
          <span className="inline-block rounded-full bg-primary-light px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
            {director.role}
          </span>
          <h3 className="mt-4 font-sans text-2xl font-black tracking-tight text-on-background">{director.name}</h3>
          {director.bio && (
            <p className="mt-3 line-clamp-3 max-w-3xl font-sans text-base leading-relaxed text-on-background/70">
              {director.bio}
            </p>
          )}

          <Link
            to="/people"
            className="group mt-6 inline-flex h-14 max-w-full items-center gap-3 rounded-full border border-outline bg-background py-2 pl-2 pr-5 transition-colors hover:border-on-background sm:gap-4 sm:pr-6"
          >
            <span className="flex shrink-0 -space-x-3">
              {team.slice(0, 5).map((member, index) => (
                <TeamAvatar
                  key={member.id}
                  name={member.name}
                  imageUrl={member.imageUrl ?? ""}
                  className={index >= 3 ? "hidden sm:block" : undefined}
                />
              ))}
            </span>
            <span className="whitespace-nowrap font-sans text-xs font-black uppercase tracking-widest text-on-background">
              <span className="sm:hidden">Meet the team</span>
              <span className="hidden sm:inline">Meet all {currentCount} people</span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
