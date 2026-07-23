import { NEWS } from '@/data';
import type { NewsItem } from '@/types';

interface NewsSectionProps {
  onSelectNews: (news: NewsItem) => void;
}

export default function NewsSection({ onSelectNews }: NewsSectionProps) {
  return (
    <section id="rounded-news" className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">

      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          LABORATORY DISPATCHES
        </span>
        <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase select-none">
          News from the Lab
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {NEWS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectNews(item)}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden mb-6 border border-outline bg-surface rounded-2xl">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 filter grayscale contrast-110 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </div>

            <span className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-3">
              {item.date}
            </span>

            <h3 className="font-sans text-xl font-black text-on-background group-hover:text-primary transition-colors mb-3 tracking-tight leading-snug uppercase">
              {item.title}
            </h3>

            <p className="font-sans text-sm text-on-background/60 leading-[1.6] font-normal">
              {item.content}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
