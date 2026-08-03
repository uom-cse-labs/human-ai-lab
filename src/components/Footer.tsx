import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface FooterProps {
  onContactClick: () => void;
}

export default function Footer({ onContactClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { label: "WHO WE ARE", route: "/about" },
    { label: "RESEARCH THEMES", route: "/themes" },
    { label: "PROJECTS", route: "/projects" },
    { label: "PUBLICATIONS", route: "/publications" },
    { label: "PIONEERS", route: "/pioneers" },
    { label: "NEWS", route: "/news" },
  ];

  return (
    <footer className="bg-surface-dim text-on-background pt-24 pb-16 border-t border-outline">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-outline">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/humanailogo.jpeg"
                alt="Human AI Lab"
                className="w-auto h-24 object-contain"
              />
            </div>

            <p className="font-sans text-sm text-on-background/60 leading-relaxed font-normal max-w-sm">
              Sri Lanka's leading hub for research at the intersection of
              intelligence, ethical algorithmic architecture, and human
              psychology.
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
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.route}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "justify-start",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-5">
            <h4 className="font-mono text-[10px] font-black text-primary tracking-[0.25em] uppercase">
              CONNECT
            </h4>
            <p className="font-sans text-sm text-on-background/60 leading-relaxed font-normal">
              We welcome collaboration proposals, graduate research inquiries,
              and public policy partnerships.
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
            &copy; {currentYear} HUMAN AI LAB, UNIVERSITY OF MORATUWA. ALL
            RIGHTS RESERVED.
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
