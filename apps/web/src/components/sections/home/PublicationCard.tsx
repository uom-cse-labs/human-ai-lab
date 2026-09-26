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
        className="group relative h-[460px] cursor-pointer overflow-hidden border border-outline transition-all duration-700 hover:border-on-background/30 hover:shadow-2xl rounded-2xl"
      >
        <img
          src={paper.imageUrl}
          alt={paper.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 grayscale-[0.8] contrast-100 brightness-[0.6]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20 opacity-90 transition-all duration-700 group-hover:opacity-95 group-hover:from-black group-hover:via-black/80" />

        <div className="absolute inset-0 p-8 md:p-10 flex flex-col text-white z-10">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-end">
              <span className="font-mono text-[10px] text-white/90 font-bold tracking-[0.2em] border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/5 shadow-sm">
                {paper.year}
              </span>
            </div>
            
            <div className="mt-auto flex flex-col transform transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="font-sans text-2xl md:text-[28px] font-extrabold tracking-tight mb-4 group-hover:text-white transition-colors line-clamp-3 leading-[1.2] drop-shadow-md">
                {paper.title}
              </h3>
              
              <div className="w-12 h-1 bg-sky-400 mb-5 rounded-full opacity-80" />
              
              <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed font-medium line-clamp-2 mb-6 drop-shadow-sm">
                {paper.authors}
              </p>
              
              {paper.publishedIn && (
                <div className="flex items-start gap-3 mb-6">
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/20 px-2 py-0.5 rounded-sm mt-0.5">VENUE</span>
                  <span className="text-xs md:text-sm text-white/80 font-medium leading-relaxed italic line-clamp-2">{paper.publishedIn}</span>
                </div>
              )}
              
              <div className="pt-5 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <span className="font-mono text-[10px] font-black tracking-[0.25em] text-sky-400 uppercase">
                  READ BRIEF & CHAT
                </span>
                <ArrowUpRight className="w-5 h-5 text-sky-400 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
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
      className="group bg-surface hover:bg-surface-dim border border-outline hover:border-primary/40 p-8 md:p-10 flex flex-col justify-between h-[460px] cursor-pointer transition-all duration-700 hover:shadow-xl rounded-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <span className="font-mono text-[10px] text-on-background/50 font-bold tracking-[0.2em] border border-outline px-3 py-1.5 rounded-full bg-surface-container">
            {paper.year}
          </span>
        </div>

        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="font-sans text-2xl md:text-[28px] font-extrabold tracking-tight text-on-background leading-[1.2] group-hover:text-primary transition-colors line-clamp-3 mb-4">
            {paper.title}
          </h3>
          
          <div className="w-12 h-1 bg-primary/40 mb-5 rounded-full" />
          
          <p className="font-sans text-sm md:text-base text-on-background/60 leading-relaxed font-medium line-clamp-3">
            {paper.authors}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col">
        {paper.publishedIn && (
          <div className="flex items-start gap-3 mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
             <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-on-background/40 border border-outline px-2 py-0.5 rounded-sm mt-0.5">VENUE</span>
             <span className="text-xs md:text-sm text-on-background/70 font-medium leading-relaxed italic line-clamp-2">{paper.publishedIn}</span>
          </div>
        )}
        
        <div className="pt-5 border-t border-outline flex items-center justify-between mt-auto group-hover:border-primary/20 transition-colors">
          <span className="font-mono text-[10px] font-black tracking-[0.25em] text-primary uppercase group-hover:text-primary-hover transition-colors">
            READ BRIEF & CHAT
          </span>
          <ArrowUpRight className="w-5 h-5 text-primary group-hover:text-primary-hover transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}
