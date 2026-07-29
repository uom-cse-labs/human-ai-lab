import { Link } from "@tanstack/react-router";
import type { ProjectIndexItem } from "@/lib/projects";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  item: ProjectIndexItem;
}

export default function ProjectCard({ item }: ProjectCardProps) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col h-full bg-surface-dim hover:bg-surface border border-outline hover:border-primary/40 rounded-3xl p-6 md:p-8 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden mb-6 rounded-2xl border border-outline shadow-sm">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110 brightness-95 group-hover:grayscale-0 group-hover:brightness-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-grow">
        <span className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-3 block">
          {item.date}
        </span>
        <h3 className="font-sans text-2xl font-black text-on-background group-hover:text-primary transition-colors mb-4 tracking-tight leading-snug uppercase line-clamp-3">
          {item.title}
        </h3>
        <p className="font-sans text-sm text-on-background/60 leading-[1.6] font-normal line-clamp-3">
          {item.content}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-outline flex items-center justify-between">
        <span className="font-mono text-[10px] font-black tracking-widest text-on-background/50 uppercase group-hover:text-white transition-colors">
          VIEW PROJECT
        </span>
        <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-250" />
      </div>
    </Link>
  );
}
