import { Button } from '@/components/ui/button';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onContactClick: () => void;
}

export default function Footer({ onNavigate, onContactClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (id: string) => {
    onNavigate(id);
  };

  return (
    <footer className="bg-surface-dim text-on-background pt-24 pb-16 border-t border-outline">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-outline">

          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center font-sans font-black text-white text-sm tracking-tighter italic rounded-full">
                AIM.
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-sm tracking-wider text-on-background uppercase">
                  AIM LAB
                </span>
                <span className="font-mono text-[8px] tracking-[0.2em] text-primary font-bold">
                  MORATUWA
                </span>
              </div>
            </div>

            <p className="font-sans text-sm text-on-background/60 leading-relaxed font-normal max-w-sm">
              Sri Lanka's leading hub for research at the intersection of intelligence, ethical algorithmic architecture, and human psychology.
            </p>

            <div className="space-y-1">
              <p className="font-sans text-xs text-on-background/40">
                Department of Computer Science & Engineering
              </p>
              <p className="font-sans text-xs text-on-background/40">
                University of Moratuwa, Sri Lanka
              </p>
            </div>
          </div>

          <div className="md:col-span-3 space-y-5">
            <h4 className="font-mono text-[10px] font-black text-primary tracking-[0.25em] uppercase">
              SITEMAP
            </h4>
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick('rounded-mission')}
                className="justify-start py-2.5"
              >
                WHO WE ARE
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick('rounded-focus-areas')}
                className="justify-start py-2.5"
              >
                RESEARCH THEMES
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick('rounded-publications')}
                className="justify-start py-2.5"
              >
                PUBLICATIONS ARCHIVE
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick('rounded-leadership')}
                className="justify-start py-2.5"
              >
                RESEARCH PIONEERS
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick('rounded-news')}
                className="justify-start py-2.5"
              >
                LAB DISPATCHES
              </Button>
            </div>
          </div>

          <div className="md:col-span-4 space-y-5">
            <h4 className="font-mono text-[10px] font-black text-primary tracking-[0.25em] uppercase">
              CONNECT
            </h4>
            <p className="font-sans text-sm text-on-background/60 leading-relaxed font-normal">
              We welcome collaboration proposals, graduate research inquiries, and public policy partnerships.
            </p>
            <div className="flex pt-2">
              <Button onClick={onContactClick} size="lg">
                INQUIRE DIRECTLY
              </Button>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] text-on-background/40 tracking-wider uppercase">
            &copy; {currentYear} AIM LAB, UNIVERSITY OF MORATUWA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[9px] tracking-wider text-on-background/30 uppercase">
              PILL DESIGN SYSTEM
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
