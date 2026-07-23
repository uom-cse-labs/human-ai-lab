import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onExploreResearch: () => void;
  onViewPublications: () => void;
}

export default function HeroSection({ onExploreResearch, onViewPublications }: HeroSectionProps) {
  return (
    <section
      id="rounded-hero"
      className="relative min-h-[90vh] flex items-center bg-background overflow-hidden py-24 border-b border-outline"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt=""
          className="w-full h-full object-cover object-center filter grayscale contrast-100 opacity-25 brightness-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-11 xl:col-span-10 flex flex-col items-start">

          <div className="mb-8 flex items-center gap-3 animate-fade-in">
            <span className="w-12 h-[2px] bg-[#F27D26]" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
              SRI LANKA'S PREMIER HUB FOR AI RESEARCH
            </span>
          </div>

          <h1
            className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] mb-10 uppercase select-none"
          >
            Advancing the <span className="text-[#F27D26] italic">Human</span> <span className="text-on-background relative inline-block underline decoration-[#F27D26] decoration-[6px] md:decoration-[10px] underline-offset-[8px] md:underline-offset-[14px]">Dimension</span> of AI.
          </h1>

          <p
            className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mb-12 font-normal"
          >
            AIM at the University of Moratuwa bridges the gap between complex neural architectures and core human values through rigorous, multidisciplinary scientific exploration.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Button size="xl" onClick={onExploreResearch}>
              EXPLORE THEMES
            </Button>
            <Button variant="outline" size="xl" onClick={onViewPublications}>
              PUBLICATIONS
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
