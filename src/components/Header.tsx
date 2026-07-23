import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
          id="header-logo"
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
            <button
              key={item.label}
              onClick={() => handleNavItemClick(item.id)}
              className="font-sans text-[10px] font-bold tracking-[0.3em] text-on-background/50 hover:text-[#F27D26] transition-colors duration-200 cursor-pointer uppercase"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={onSearchClick} className="p-2 text-on-background/60 hover:text-[#F27D26] transition-colors duration-200 cursor-pointer" title="Search Publications">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onContactClick}
            className="px-8 py-3.5 bg-on-background text-background font-sans text-[10px] font-black tracking-[0.25em] hover:bg-[#F27D26] hover:text-white transition-colors duration-200 rounded-full cursor-pointer uppercase"
          >
            CONNECT
          </button>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <button onClick={onSearchClick} className="p-2 text-on-background/60 hover:text-[#F27D26]">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-on-background/60 hover:text-on-background">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline bg-background px-6 py-6 flex flex-col gap-4 animate-fade-in">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => handleNavItemClick(item.id)} className="text-left py-2.5 font-sans text-[11px] font-bold tracking-[0.25em] text-on-background/60 hover:text-[#F27D26] uppercase">
              {item.label}
            </button>
          ))}
          <div className="h-px bg-outline my-2" />
          <button
            onClick={() => { onContactClick(); setMobileMenuOpen(false); }}
            className="w-full text-center py-4 bg-[#F27D26] text-black font-sans text-[10px] font-black tracking-[0.25em] rounded-full uppercase"
          >
            CONNECT
          </button>
        </div>
      )}
    </header>
  );
}
