import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { PUBLICATIONS } from '@/data'
import { Search, X, FileText, CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLab } from '@/lab-context'
import type { Publication } from '@/types'

export const Route = createFileRoute('/publications')({
  component: PublicationsPage,
})

function PublicationsPage() {
  const { setSelectedPaper } = useLab()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [showSearchBox, setShowSearchBox] = useState(false)
  
  const [activeReaderPaper, setActiveReaderPaper] = useState<Publication | null>(PUBLICATIONS[0] || null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const categories = ['ALL', 'INTELLIGENCE', 'ETHICS', 'DESIGN', 'ROBOTICS']

  const handleSearchArchiveClick = () => {
    setShowSearchBox(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  const filteredPapers = PUBLICATIONS.filter((paper) => {
    const matchesCategory = activeCategory === 'ALL' || paper.category === activeCategory
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.publishedIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    if (activeReaderPaper && !filteredPapers.find(p => p.id === activeReaderPaper.id)) {
      if (filteredPapers.length > 0) setActiveReaderPaper(filteredPapers[0])
      else setActiveReaderPaper(null)
    }
  }, [filteredPapers, activeReaderPaper])

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Editorial Hero */}
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-1/2 h-full bg-primary blur-[150px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col gap-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/10 w-fit px-3 py-1 rounded-full">
            SCHOLARLY OUTPUT
          </span>
          <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase max-w-5xl">
            The Publications Archive
          </h1>
          <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mt-4">
            Explore our complete archive of peer-reviewed research presented at leading global conferences including NeurIPS, CHI, and AAAI. Our papers reflect our commitment to open, transparent, and ethically-grounded AI research.
          </p>
        </div>
      </section>

      {/* Split Pane Interface */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Pane: Archive List */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:sticky lg:top-28">
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-on-background">
                  Index
                </h2>
                {!showSearchBox ? (
                  <Button variant="outline" size="sm" onClick={handleSearchArchiveClick} className="rounded-full">
                    <Search className="w-4 h-4 mr-2" /> SEARCH
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 bg-surface border border-outline py-1.5 px-3 rounded-full animate-fade-in w-full max-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-primary" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none text-sm text-on-background placeholder-on-background/30 focus:outline-none"
                    />
                    <button onClick={() => { setSearchTerm(''); setShowSearchBox(false); }} className="text-on-background/50 hover:text-on-background">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pb-4 border-b border-outline">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${
                      activeCategory === cat 
                        ? 'bg-primary text-white font-black' 
                        : 'bg-surface border border-outline text-on-background/70 hover:text-on-background'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 lg:max-h-[70vh]">
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper) => {
                  const isActive = activeReaderPaper?.id === paper.id;
                  return (
                    <div
                      key={paper.id}
                      onClick={() => setActiveReaderPaper(paper)}
                      className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                        isActive 
                          ? 'bg-surface-dim border-primary' 
                          : 'bg-surface border-outline hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {paper.category}
                        </Badge>
                        <span className="font-mono text-[10px] text-on-background/40 font-bold">
                          {paper.year}
                        </span>
                      </div>
                      <h3 className={`font-sans text-base font-black leading-[1.3] tracking-tight uppercase line-clamp-2 mb-2 transition-colors ${isActive ? 'text-on-background' : 'text-on-background group-hover:text-primary'}`}>
                        {paper.title}
                      </h3>
                      <p className="font-sans text-xs text-on-background/50 leading-relaxed italic truncate">
                        {paper.authors}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-surface/40 border border-dashed border-outline rounded-2xl">
                  <p className="font-sans text-on-background/40 font-normal">
                    No publications found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Reader Detail */}
          <div className="w-full lg:w-7/12">
            {activeReaderPaper ? (
              <div className="bg-surface border border-outline rounded-3xl p-8 md:p-12 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <FileText className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase border-primary/30 text-primary mb-6">
                    {activeReaderPaper.publishedIn} — {activeReaderPaper.year}
                  </Badge>
                  
                  <h2 className="font-sans text-3xl md:text-4xl font-black tracking-tighter text-on-background uppercase mb-6 leading-[1.1]">
                    {activeReaderPaper.title}
                  </h2>
                  
                  <p className="font-sans text-lg text-on-background/60 italic mb-10 pb-10 border-b border-outline">
                    {activeReaderPaper.authors}
                  </p>

                  <div className="mb-10">
                    <h4 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                      Abstract
                    </h4>
                    <p className="font-sans text-lg text-on-background/80 leading-[1.8]">
                      {activeReaderPaper.abstract}
                    </p>
                  </div>

                  <div className="mb-10 bg-surface-dim p-6 rounded-2xl border border-outline">
                    <h4 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-on-background/50 mb-6">
                      Key Findings
                    </h4>
                    <ul className="space-y-4">
                      {activeReaderPaper.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex gap-4 items-start">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="font-sans text-base text-on-background/80 leading-[1.6]">
                            {finding}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-10">
                    <h4 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-on-background/50 mb-4">
                      Citation
                    </h4>
                    <p className="font-mono text-xs text-on-background/60 leading-[1.6] bg-background p-4 rounded-xl border border-outline select-all">
                      {activeReaderPaper.citation}
                    </p>
                  </div>

                  <Button 
                    className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest rounded-full transition-colors h-auto py-3 px-6 text-xs md:text-sm shadow-md"
                    onClick={() => setSelectedPaper(activeReaderPaper)}
                  >
                    <BookOpen className="w-4 h-4 mr-2 stroke-[2.5]" /> OPEN INTERACTIVE READER
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[60vh] bg-surface/30 border border-dashed border-outline rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                <FileText className="w-12 h-12 text-on-background/20 mb-4" />
                <h3 className="font-sans text-xl font-black text-on-background/40 uppercase">No Paper Selected</h3>
                <p className="font-sans text-sm text-on-background/30 mt-2">Select a publication from the index to view details.</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  )
}
