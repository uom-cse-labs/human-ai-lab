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
  return (
    <section
      id="rounded-focus-areas"
      className="bg-background py-28 border-b border-outline"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              AREAS OF INVESTIGATION
            </span>
            <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase select-none">
              Research Themes
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllClick}
            className="gap-2"
          >
            VIEW ALL THEMES
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {FOCUS_AREAS.map((area, index) => {
            const colSpan =
              index === 0 || index === 3
                ? "lg:col-span-8 md:col-span-2"
                : "lg:col-span-4 md:col-span-1";

            return (
              <div key={area.id} className={colSpan}>
                <FocusAreaCard area={area} onSelect={onSelectArea} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
