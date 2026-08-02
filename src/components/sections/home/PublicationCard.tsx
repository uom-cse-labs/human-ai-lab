import type { Publication } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface PublicationCardProps {
  paper: Publication;
  onRead: (paper: Publication) => void;
}

export default function PublicationCard({
  paper,
  onRead,
}: PublicationCardProps) {
  const hasImage = !!paper.imageUrl;

  if (hasImage) {
    return (
      <div
        key={paper.id}
        onClick={() => onRead(paper)}
        className="group relative h-[420px] cursor-pointer overflow-hidden border border-outline transition-colors duration-300 hover:border-on-background/20 rounded-2xl"
      >
        <img
          src={paper.imageUrl}
          alt={paper.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-[0.35]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay/95 via-overlay/45 to-transparent rounded-2xl" />

        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
          <div className="flex items-center justify-between mb-4">
            <Badge className="max-w-fit">{paper.category}</Badge>
            <span className="font-mono text-[10px] text-white/70 font-bold">
              {paper.year}
            </span>
          </div>
          <h3 className="font-sans text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors uppercase line-clamp-3">
            {paper.title}
          </h3>
          <p className="font-sans text-sm text-white/75 leading-[1.6] max-w-xl font-normal italic line-clamp-2">
            {paper.authors}
          </p>
          {paper.publishedIn && (
            <Badge
              variant="outline"
              className="mt-4 max-w-fit border-white/30 text-primary/80"
            >
              {paper.publishedIn}
            </Badge>
          )}
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            READ BRIEF & CHAT <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      key={paper.id}
      onClick={() => onRead(paper)}
      className="group bg-surface hover:bg-surface-dim border border-outline hover:border-primary/40 p-8 flex flex-col justify-between h-[420px] cursor-pointer transition-all duration-300 rounded-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="ghost">{paper.category}</Badge>
          <span className="font-mono text-[10px] text-on-background/70 font-bold">
            {paper.year}
          </span>
        </div>

        <h3 className="font-sans text-2xl font-black tracking-tight text-on-background leading-[1.3] group-hover:text-primary transition-colors line-clamp-3 uppercase">
          {paper.title}
        </h3>

        <p className="font-sans text-sm text-on-background/75 leading-[1.6] font-normal italic line-clamp-2">
          {paper.authors}
        </p>

        <Badge variant="outline">{paper.publishedIn}</Badge>
      </div>

      <div className="pt-6 border-t border-outline flex items-center justify-between mt-auto">
        <span className="font-mono text-[10px] font-black tracking-[0.25em] text-primary uppercase group-hover:text-white transition-colors">
          READ BRIEF & CHAT
        </span>
        <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-250" />
      </div>
    </div>
  );
}
