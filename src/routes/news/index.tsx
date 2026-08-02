import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllArticles } from "@/lib/news";
import type { NewsIndexItem } from "@/lib/news";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/news/")({
  component: NewsPage,
});

function NewsPage() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Hero Section */}
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-1/2 h-full bg-primary blur-[150px] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col gap-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/10 w-fit px-3 py-1 rounded-full">
            LABORATORY NEWS
          </span>
          <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase max-w-5xl">
            News from the Lab
          </h1>
          <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mt-4">
            Stay updated on the latest research breakthroughs, team
            announcements, conference attendances, and media features
            surrounding the Human AI Lab.
          </p>
        </div>
      </section>

      {/* Featured News */}
      {featured && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-8 border-b border-outline pb-4">
            LATEST NEWS
          </h2>
          <Link
            to="/news/$slug"
            params={{ slug: featured.slug }}
            className="group flex flex-col lg:flex-row gap-8 lg:gap-16 items-center bg-surface border border-outline rounded-3xl p-6 md:p-8 hover:border-primary/50 transition-colors"
          >
            <div className="w-full lg:w-3/5 overflow-hidden rounded-2xl relative aspect-[16/9] lg:aspect-[4/3]">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="w-full lg:w-2/5 flex flex-col justify-center">
              <span className="font-mono text-xs font-black text-primary tracking-[0.2em] uppercase mb-4 block">
                {featured.date}
              </span>
              <h3 className="font-sans text-2xl md:text-4xl font-black text-on-background tracking-tight leading-[1.1] uppercase mb-6 group-hover:text-primary transition-colors">
                {featured.title}
              </h3>
              <p className="font-sans text-lg text-on-background/70 leading-[1.6] font-normal mb-8">
                {featured.content}
              </p>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-on-background group-hover:text-primary transition-colors">
                READ FULL NEWS <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Archive Grid */}
      {rest.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-8 border-b border-outline pb-4">
            PREVIOUS NEWS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rest.map((item: NewsIndexItem) => (
              <Link
                key={item.slug}
                to="/news/$slug"
                params={{ slug: item.slug }}
                className="group flex flex-col h-full bg-surface-dim hover:bg-surface border border-outline hover:border-primary/40 rounded-3xl p-6 md:p-8 transition-all duration-300"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden mb-6 rounded-2xl border border-outline shadow-sm">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110 brightness-95 group-hover:grayscale-0 group-hover:brightness-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-grow">
                  <span className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-3 block">
                    {item.date}
                  </span>
                  <h3 className="font-sans text-2xl font-black text-on-background group-hover:text-primary transition-colors mb-4 tracking-tight leading-snug uppercase line-clamp-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-on-background/60 leading-[1.6] font-normal line-clamp-3">
                    {item.content}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-outline flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black tracking-widest text-on-background/50 uppercase group-hover:text-white transition-colors">
                    READ ARTICLE
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-250" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
