import type { Publication } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight } from 'lucide-react'

interface PublicationCardProps {
  paper: Publication
  onRead: (paper: Publication) => void
}

export default function PublicationCard({ paper, onRead }: PublicationCardProps) {
  return (
    <div
      key={paper.id}
      onClick={() => onRead(paper)}
      className="group bg-surface hover:bg-surface-dim border border-outline hover:border-primary/40 p-8 flex flex-col justify-between h-[420px] cursor-pointer transition-all duration-300 rounded-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="ghost">{paper.category}</Badge>
          <span className="font-mono text-[10px] text-on-background/40 font-bold">
            {paper.year}
          </span>
        </div>

        <h3 className="font-sans text-lg font-black text-on-background leading-[1.3] tracking-tight group-hover:text-primary transition-colors line-clamp-3 uppercase">
          {paper.title}
        </h3>

        <p className="font-sans text-[13px] text-on-background/50 leading-relaxed italic line-clamp-2">
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
  )
}
