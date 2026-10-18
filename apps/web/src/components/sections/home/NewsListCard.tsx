import { Link } from '@tanstack/react-router'
import type { NewsIndexItem } from '@/lib/news'

/** A compact story: headline and date, with a small thumbnail on the right (DESIGN.md §4 list cards). */
export default function NewsListCard({ item }: { item: NewsIndexItem }) {
  return (
    <li>
      <Link to="/news/$slug" params={{ slug: item.slug }} className="group flex items-start gap-5 py-6">
        <div className="min-w-0 flex-1">
          <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-primary">{item.date}</span>
          <h3 className="font-sans text-lg font-bold leading-snug text-on-background transition-colors group-hover:text-primary">
            {item.title}
          </h3>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
            referrerPolicy="no-referrer"
          />
        )}
      </Link>
    </li>
  )
}
