import { createFileRoute, Link } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { getAllArticles, getArticleBody } from "@/lib/news";
import type { NewsIndexItem } from "@/lib/news";
import { ArrowLeft, Twitter, Linkedin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/news/$slug")({
  component: NewsArticle,
});

function NewsArticle() {
  const { slug } = Route.useParams();
  const articles = getAllArticles();
  const article = articles.find((a) => a.slug === slug) ?? null;
  const body = article ? getArticleBody(slug) : null;

  const relatedArticles = articles.filter((a) => a.slug !== slug).slice(0, 2);

  if (!article || !body) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="font-sans text-2xl font-black text-on-background mb-4">
          Article Not Found
        </h1>
        <Link to="/dispatches">
          <Button variant="outline">Back to Dispatches</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-6 pb-16 md:pb-24">
          <Link
            to="/dispatches"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors mb-8 w-fit bg-surface-container px-4 py-2 rounded-full border border-outline backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> LAB DISPATCHES
          </Link>
          <div className="max-w-4xl">
            <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95] mb-6">
              {article.title}
            </h1>
            <p className="font-sans text-xl md:text-2xl text-white/70 leading-[1.4] font-medium border-l-4 border-primary pl-6 py-2">
              {article.content}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-3 space-y-12">
            <div>
              <span className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-2 block">
                PUBLISHED ON
              </span>
              <span className="font-sans text-lg font-bold text-on-background">
                {article.date}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-4 block">
                SHARE DISPATCH
              </span>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-outline hover:border-primary hover:text-primary"
                  disabled={!article.share?.twitter}
                  onClick={() => article.share?.twitter && window.open(article.share.twitter, '_blank', 'noopener,noreferrer')}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-outline hover:border-primary hover:text-primary"
                  disabled={!article.share?.linkedin}
                  onClick={() => article.share?.linkedin && window.open(article.share.linkedin, '_blank', 'noopener,noreferrer')}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-outline hover:border-primary hover:text-primary"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-px w-full bg-outline hidden lg:block" />

            <div className="hidden lg:block">
              <span className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-4 block">
                PRESS INQUIRIES
              </span>
              <p className="font-sans text-xs text-on-background/60 leading-[1.6]">
                For media inquiries regarding this dispatch, please contact the
                Human AI Lab communications office.
              </p>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="prose prose-lg max-w-none">
              <Markdown>{body}</Markdown>
            </div>
          </div>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-20 border-t border-outline">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-sans text-3xl font-black tracking-tighter text-on-background uppercase">
              More from the Lab
            </h2>
            <Link to="/dispatches">
              <Button
                variant="ghost"
                className="font-mono text-[10px] tracking-widest uppercase"
              >
                View Archive <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedArticles.map((item: NewsIndexItem) => (
              <Link
                key={item.slug}
                to="/news/$slug"
                params={{ slug: item.slug }}
                className="group flex flex-col sm:flex-row gap-6 p-6 border border-outline bg-surface rounded-2xl hover:border-primary/50 transition-colors"
              >
                <div className="w-full sm:w-1/3 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 transition-transform duration-500"
                    alt={item.title}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-2 block">
                    {item.date}
                  </span>
                  <h3 className="font-sans text-lg font-black text-on-background leading-snug group-hover:text-primary transition-colors uppercase line-clamp-3">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
