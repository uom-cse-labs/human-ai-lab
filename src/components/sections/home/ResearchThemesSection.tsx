import { useState, useRef } from "react";
import { FOCUS_AREAS } from "@/data";
import type { FocusArea } from "@/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FocusAreaCard from "./FocusAreaCard";

interface ResearchThemesSectionProps {
  onSelectArea: (area: FocusArea) => void;
  onViewAllClick: () => void;
}

export default function ResearchThemesSection({
  onSelectArea,
  onViewAllClick,
}: ResearchThemesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const dx = e.clientX - centerX;
    
    // Normalized position (-1 to 1) relative to section width
    const normX = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
    
    // Smooth, subtle rotation angle (max -15deg to +15deg)
    setRotation(normX * 15);
  };

  const handleMouseLeave = () => {
    setRotation(0);
  };

  return (
    <section
      id="rounded-focus-areas"
      className="bg-background py-28 border-b border-outline relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              AREAS OF INVESTIGATION
            </span>
            <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase">
              Research Themes
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllClick}
            className="gap-2 group"
          >
            VIEW ALL THEMES
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </div>

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-6xl mx-auto py-12 flex flex-col items-center mt-8"
        >
          {/* Central Vertical Dashed Line */}
          <div className="absolute left-1/2 top-[8%] bottom-[8%] w-[2px] bg-transparent border-l-2 border-dashed border-primary/30 -translate-x-1/2 z-0 hidden md:block" />

          {/* Desktop layout */}
          <div className="hidden md:flex w-full flex-col items-center z-10">
            <div className="w-full flex justify-between gap-16 relative">
              {/* Horizontal connector lines */}
              <div className="absolute left-[25%] right-[25%] top-1/2 h-[2px] border-t-2 border-dashed border-primary/30 -translate-y-1/2 z-0" />

              <div className="w-1/2 flex justify-end pr-8 z-10">
                <div className="w-full max-w-sm bg-background rounded-2xl">
                  <FocusAreaCard
                    area={FOCUS_AREAS[0]}
                    onSelect={onSelectArea}
                  />
                </div>
              </div>
              <div className="w-1/2 flex justify-start pl-8 z-10">
                <div className="w-full max-w-sm bg-background rounded-2xl">
                  <FocusAreaCard
                    area={FOCUS_AREAS[1]}
                    onSelect={onSelectArea}
                  />
                </div>
              </div>
            </div>

            {/* Smooth Reaction Center Node */}
            <div className="relative z-20 my-[-2.5rem] p-4 bg-background rounded-full shrink-0">
              <div className="w-48 h-48 rounded-full overflow-hidden border border-outline shadow-[0_0_40px_rgba(var(--primary),0.12)] relative">
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 pointer-events-none" />
                <img
                  src="/hand_in_hand.png"
                  alt="Central AI Node"
                  className="w-full h-full object-cover scale-110"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>

            <div className="w-full flex justify-between gap-16 relative">
              {/* Horizontal connector lines */}
              <div className="absolute left-[25%] right-[25%] top-1/2 h-[2px] border-t-2 border-dashed border-primary/30 -translate-y-1/2 z-0" />

              <div className="w-1/2 flex justify-end pr-8 z-10">
                <div className="w-full max-w-sm bg-background rounded-2xl">
                  <FocusAreaCard
                    area={FOCUS_AREAS[2]}
                    onSelect={onSelectArea}
                  />
                </div>
              </div>
              <div className="w-1/2 flex justify-start pl-8 z-10">
                <div className="w-full max-w-sm bg-background rounded-2xl">
                  <FocusAreaCard
                    area={FOCUS_AREAS[3]}
                    onSelect={onSelectArea}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col w-full relative z-10 py-4 space-y-8">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              preserveAspectRatio="none"
            >
              <line
                x1="50%"
                y1="5%"
                x2="50%"
                y2="95%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/30"
                strokeDasharray="6 6"
              />
              <line
                x1="50%"
                y1="13%"
                x2="15%"
                y2="13%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/30"
                strokeDasharray="6 6"
              />
              <line
                x1="50%"
                y1="38%"
                x2="85%"
                y2="38%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/30"
                strokeDasharray="6 6"
              />
              <line
                x1="50%"
                y1="62%"
                x2="15%"
                y2="62%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/30"
                strokeDasharray="6 6"
              />
              <line
                x1="50%"
                y1="87%"
                x2="85%"
                y2="87%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/30"
                strokeDasharray="6 6"
              />
            </svg>

            <div className="w-[85%] mr-auto bg-background rounded-2xl z-10 shadow-lg">
              <FocusAreaCard area={FOCUS_AREAS[0]} onSelect={onSelectArea} />
            </div>
            <div className="w-[85%] ml-auto bg-background rounded-2xl z-10 shadow-lg">
              <FocusAreaCard area={FOCUS_AREAS[1]} onSelect={onSelectArea} />
            </div>

            <div className="relative z-20 p-2 bg-background rounded-full mx-auto self-center shrink-0 my-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border border-outline shadow-[0_0_30px_rgba(var(--primary),0.12)] relative">
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                <img
                  src="/hand_in_hand.png"
                  alt="Central AI Node"
                  className="w-full h-full object-cover scale-110"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>

            <div className="w-[85%] mr-auto bg-background rounded-2xl z-10 shadow-lg">
              <FocusAreaCard area={FOCUS_AREAS[2]} onSelect={onSelectArea} />
            </div>
            <div className="w-[85%] ml-auto bg-background rounded-2xl z-10 shadow-lg">
              <FocusAreaCard area={FOCUS_AREAS[3]} onSelect={onSelectArea} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
