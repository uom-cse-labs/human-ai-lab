import { useState, useRef } from 'react';
import type { Publication } from '@/types';
import { PUBLICATIONS } from '@/data';
import { Search, ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PublicationsSectionProps {
  onReadPaper: (paper: Publication) => void;
}

export default function PublicationsSection({ onReadPaper }: PublicationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showSearchBox, setShowSearchBox] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = ['ALL', 'INTELLIGENCE', 'ETHICS', 'DESIGN', 'ROBOTICS'];

  const handleSearchArchiveClick = () => {
    setShowSearchBox(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const filteredPapers = PUBLICATIONS.filter((paper) => {
    const matchesCategory = activeCategory === 'ALL' || paper.category === activeCategory;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.publishedIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="rounded-publications" className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
            SCHOLARLY OUTPUT
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 mb-4 uppercase select-none">
            Recent Publications
          </h2>
          <p className="font-sans text-base text-on-background/60 leading-[1.6] font-normal">
            Our latest peer-reviewed research presented at leading global conferences including NeurIPS, CHI, and AAAI.
          </p>
        </div>

        {!showSearchBox ? (
          <Button
            variant="outline"
            size="lg"
            onClick={handleSearchArchiveClick}
          >
            SEARCH ARCHIVE
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full lg:w-96 bg-surface border border-outline py-2.5 px-4 self-start lg:self-end animate-fade-in rounded-full">
            <Search className="w-4 h-4 text-primary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by title, author, key term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-on-background placeholder-on-background/30 focus:outline-none"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setSearchTerm('');
                setShowSearchBox(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5 mb-12 border-b border-outline pb-6">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="font-mono"
          >
            {cat}
          </Button>
        ))}
      </div>

      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              onClick={() => onReadPaper(paper)}
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
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface/40 border border-dashed border-outline rounded-2xl">
          <p className="font-sans text-on-background/40 font-normal">
            No publications found matching your active filter criteria.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('ALL');
            }}
            className="mt-4 underline"
          >
            Clear Filters & Search
          </Button>
        </div>
      )}

    </section>
  );
}
