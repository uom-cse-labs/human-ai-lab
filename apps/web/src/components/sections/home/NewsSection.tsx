import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useNews } from '@/lib/news';
import NewsFeatureCard from './NewsFeatureCard';
import NewsListCard from './NewsListCard';

/** Latest news, right under the hero: one lead story and a compact list (DESIGN.md §8). */
export default function NewsSection() {
  const { articles } = useNews();
  const [lead, ...rest] = articles;
  if (!lead) {
    return null;
  }

  return (
    <section id="rounded-news" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Latest from the lab
          </span>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-on-background md:text-4xl">
            News
          </h2>
        </div>
        <Link
          to="/news"
          className="group inline-flex h-12 items-center rounded-full border border-outline px-6 font-sans text-xs font-black uppercase tracking-widest text-on-background transition-colors hover:border-on-background"
        >
          All news
          <ArrowRight className="ml-3 size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <NewsFeatureCard item={lead} />
        </div>
        {rest.length > 0 && (
          <ul className="divide-y divide-outline-variant border-y border-outline-variant lg:col-span-5 lg:self-start">
            {rest.slice(0, 4).map((item) => (
              <NewsListCard key={item.slug} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
