import { getAllArticles } from '@/lib/news';
import type { NewsIndexItem } from '@/lib/news';
import NewsCard from './NewsCard';

export default function NewsSection() {
  const articles = getAllArticles();

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
        {articles.map((item: NewsIndexItem) => (
          <NewsCard
            key={item.slug}
            item={item}
            to="/news/$slug"
            params={{ slug: item.slug }}
          />
        ))}
      </div>

    </section>
  );
}
