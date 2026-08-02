import { NEWS } from '@/data';
import type { NewsItem } from '@/types';
import NewsCard from './NewsCard';

export default function NewsSection() {
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
          <NewsCard key={item.id} item={item} onSelect={(item) => console.log('Selected news:', item)} />
        ))}
      </div>

    </section>
  );
}
