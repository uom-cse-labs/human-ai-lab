import { Link } from '@tanstack/react-router'
import type { NewsIndexItem } from '@/lib/news'

interface NewsCardProps {
  item: NewsIndexItem
  to: string
  params: Record<string, string>
}

export default function NewsCard({ item, to, params }: NewsCardProps) {
  return (
    <Link to={to} params={params} className="group cursor-pointer flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden mb-6 rounded-2xl border border-outline shadow-sm">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 duration-700 group-hover:opacity-100 transition-opacity" />
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
    </Link>
  )
}
