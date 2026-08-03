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
        className="group relative h-[420px] cursor-pointer overflow-hidden border border-outline transition-all duration-500 hover:border-on-background/20 hover:shadow-xl rounded-2xl"
      >
        <img
          src={paper.imageUrl}
          alt={paper.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale contrast-125 brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-2xl opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-0 p-8 flex flex-col text-white z-10">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <Badge className="bg-primary/90 hover:bg-primary border-none text-white font-semibold tracking-widest text-[9px] uppercase px-3 py-1 shadow-sm backdrop-blur-md">
                {paper.category}
              </Badge>
              <span className="font-mono text-[11px] text-white/70 font-semibold tracking-wider bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                {paper.year}
              </span>
            </div>
            
            <div className="mt-auto flex flex-col">
              <h3 className="font-sans text-xl md:text-2xl font-bold tracking-tight mb-3 group-hover:text-sky-300 transition-colors line-clamp-3 leading-snug">
                {paper.title}
              </h3>
              <p className="font-sans text-sm text-white/80 leading-relaxed font-medium line-clamp-2 mb-5">
                {paper.authors}
              </p>
              
              {paper.publishedIn && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-white/60 bg-white/10 px-2 py-1 rounded-sm backdrop-blur-md">VENUE</span>
                  <span className="text-xs text-white/90 font-medium truncate">{paper.publishedIn}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-sky-400 uppercase">
                  READ BRIEF & CHAT
                </span>
                <ArrowUpRight className="w-4 h-4 text-sky-400 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={paper.id}
      onClick={() => onRead(paper)}
      className="group bg-surface hover:bg-surface-dim border border-outline hover:border-primary/30 p-8 flex flex-col justify-between h-[420px] cursor-pointer transition-all duration-500 hover:shadow-lg rounded-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-outline">
          <Badge variant="secondary" className="font-semibold tracking-widest text-[9px] uppercase px-3 py-1 rounded-sm bg-surface-container text-on-background/80">
            {paper.category}
          </Badge>
          <span className="font-mono text-[11px] text-on-background/50 font-semibold tracking-wider">
            {paper.year}
          </span>
        </div>

        <div>
          <h3 className="font-sans text-xl md:text-2xl font-bold tracking-tight text-on-background leading-snug group-hover:text-primary transition-colors line-clamp-3 mb-4">
            {paper.title}
          </h3>
          <p className="font-sans text-sm text-on-background/70 leading-relaxed font-medium line-clamp-3">
            {paper.authors}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col">
        {paper.publishedIn && (
          <div className="flex items-center gap-3 mb-5">
             <span className="text-[9px] font-mono tracking-widest uppercase text-on-background/50 bg-surface-container px-2 py-1 rounded-sm">VENUE</span>
             <span className="text-xs text-on-background/80 font-medium truncate">{paper.publishedIn}</span>
          </div>
        )}
        
        <div className="pt-4 border-t border-outline flex items-center justify-between mt-auto">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase group-hover:text-primary-hover transition-colors">
            READ BRIEF & CHAT
          </span>
          <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-primary-hover transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
