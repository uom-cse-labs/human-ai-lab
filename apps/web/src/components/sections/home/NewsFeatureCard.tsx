import { Link } from '@tanstack/react-router'
import type { NewsIndexItem } from '@/lib/news'

/** The lead story: a large image with the headline and summary below. */
export default function NewsFeatureCard({ item }: { item: NewsIndexItem }) {
  return (
    <Link to="/news/$slug" params={{ slug: item.slug }} className="group flex flex-col">
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-3xl bg-surface-dim">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-on-background">
          Latest
        </span>
      </div>
      <span className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">{item.date}</span>
      <h3 className="mb-3 font-sans text-2xl font-black leading-snug tracking-tight text-on-background transition-colors group-hover:text-primary md:text-3xl">
        {item.title}
      </h3>
      <p className="max-w-2xl font-sans text-base leading-relaxed text-on-background/70">{item.content}</p>
    </Link>
  )
}
