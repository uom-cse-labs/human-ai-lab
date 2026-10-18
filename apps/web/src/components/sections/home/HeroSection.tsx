import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onExploreResearch: () => void;
  onViewPublications: () => void;
}

/**
 * A lab photograph in a rounded frame with a dark one-colour overlay (DESIGN.md §5), about 60% of the
 * screen tall so the latest news shows on the first screen.
 */
export default function HeroSection({
  onExploreResearch,
  onViewPublications,
}: HeroSectionProps) {
  return (
    <section id="rounded-hero" className="bg-background px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="relative mx-auto flex min-h-112 max-w-7xl items-end overflow-hidden rounded-3xl bg-tertiary md:min-h-136">
        <img
          src="/images/hero-robotic-arm.jpg"
          alt="Robotic arms in the Human-AI Lab, prepared for automated coffee making"
          className="absolute inset-0 h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-tertiary/70 to-tertiary/30 md:bg-gradient-to-r" />

        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <p className="mb-5 font-mono text-xs uppercase tracking-widest text-white/70">
            Department of Computer Science &amp; Engineering · University of Moratuwa
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Human-Centered AI Research Lab
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Advancing human-centered artificial intelligence through interdisciplinary research.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="light" size="lg" className="group" onClick={onExploreResearch}>
              Explore research themes
              <ArrowRight className="ml-3 size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Button>
            <Button variant="outline-light" size="lg" className="group" onClick={onViewPublications}>
              Read publications
              <ArrowRight className="ml-3 size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
