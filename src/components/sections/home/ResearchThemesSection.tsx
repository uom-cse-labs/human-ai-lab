import { FOCUS_AREAS } from "@/data";
import type { FocusArea } from "@/types";
import { Bot, Brain, Shield, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResearchThemesSectionProps {
  onSelectArea: (area: FocusArea) => void;
  onViewAllClick: () => void;
}

export default function ResearchThemesSection({
  onSelectArea,
  onViewAllClick,
}: ResearchThemesSectionProps) {
  const renderIcon = (name: string, className: string) => {
    switch (name) {
      case "robot":
        return <Bot className={className} />;
      case "brain":
        return <Brain className={className} />;
      case "shield":
        return <Shield className={className} />;
      case "eye":
        return <Eye className={className} />;
      default:
        return <Bot className={className} />;
    }
  };

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

            const isImageBg = !!area.imageUrl;

            if (isImageBg) {
              return (
                <div
                  key={area.id}
                  onClick={() => onSelectArea(area)}
                  className={`group relative ${colSpan} h-[420px] cursor-pointer overflow-hidden border border-outline transition-colors duration-300 hover:border-on-background/20 rounded-2xl`}
                >
                  <img
                    src={area.imageUrl}
                    alt={area.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-[0.35]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-overlay/95 via-overlay/45 to-transparent rounded-2xl" />

                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                    <Badge className="mb-4 max-w-fit">{area.type}</Badge>
                    <h3 className="font-sans text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors uppercase">
                      {area.title}
                    </h3>
                    <p className="font-sans text-sm text-white/60 leading-[1.6] max-w-xl font-normal">
                      {area.description}
                    </p>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={area.id}
                onClick={() => onSelectArea(area)}
                className={`group ${colSpan} bg-surface hover:bg-surface-dim p-8 flex flex-col justify-between h-[420px] border border-outline cursor-pointer hover:border-primary/40 transition-all duration-300 rounded-2xl`}
              >
                <div>
                  <div className="w-14 h-14 flex items-center justify-center bg-surface-container text-primary border border-outline mb-8 transition-colors group-hover:border-primary/40 rounded-2xl">
                    {renderIcon(area.iconName, "w-6 h-6")}
                  </div>
                  <h3 className="font-sans text-2xl font-black tracking-tight mb-3 text-on-background uppercase">
                    {area.title}
                  </h3>
                  <p className="font-sans text-sm leading-[1.6] text-on-background/60 font-normal">
                    {area.description}
                  </p>
                </div>

                <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary group-hover:text-white mt-6 inline-flex items-center gap-1.5 transition-colors">
                  EXPLORE THEME <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
