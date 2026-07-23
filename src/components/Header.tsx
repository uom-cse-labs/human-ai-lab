import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onContactClick: () => void;
  onSearchClick: () => void;
  onNavigate: (sectionId: string) => void;
}

export default function Header({ onContactClick, onSearchClick, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'WHO WE ARE', id: 'rounded-mission' },
    { label: 'RESEARCH THEMES', id: 'rounded-focus-areas' },
    { label: 'PUBLICATIONS', id: 'rounded-publications' },
    { label: 'PIONEERS', id: 'rounded-leadership' },
    { label: 'DISPATCHES', id: 'rounded-news' },
  ];

  const handleNavItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 border-b border-outline backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div
          onClick={() => handleNavItemClick('rounded-hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#F27D26] flex items-center justify-center font-sans font-black text-black text-base tracking-tighter italic transition-transform group-hover:scale-105 rounded-full">
            AIM.
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-sm tracking-wider text-on-background uppercase">
              AIM LAB
            </span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-[#F27D26] font-bold">
              MORATUWA
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              onClick={() => handleNavItemClick(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={onSearchClick} title="Search Publications">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="lg" onClick={onContactClick}>
            CONNECT
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={onSearchClick}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline bg-background px-6 py-6 flex flex-col gap-4 animate-fade-in">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              onClick={() => handleNavItemClick(item.id)}
              className="justify-start py-2.5"
            >
              {item.label}
            </Button>
          ))}
          <div className="h-px bg-outline my-2" />
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center py-4"
            onClick={() => { onContactClick(); setMobileMenuOpen(false); }}
          >
            CONNECT
          </Button>
        </div>
      )}
    </header>
  );
}
