import SectionHeader from "@/components/sections/SectionHeader"

interface NewsItem {
  date: string
  title: string
  description: string
  image: string
  featured: boolean
}

interface NewsSectionProps {
  news: NewsItem[]
}

export default function NewsSection({ news }: NewsSectionProps) {
  const featuredNews = news.find((n) => n.featured)!
  const listNews = news.filter((n) => !n.featured)

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Latest News" />
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-3xl lg:col-span-7">
            <img
              src={featuredNews.image}
              alt={featuredNews.title}
              className="aspect-[4/3] w-full object-cover lg:aspect-[3/2]"
              loading="lazy"
            />
            <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-caption font-semibold uppercase tracking-widest text-text-secondary">
              Announcement
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
              <p className="text-caption uppercase tracking-widest text-white/80">
                {featuredNews.date}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {featuredNews.title}
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/90">
                {featuredNews.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-5">
            {listNews.map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-4 pb-6 ${i < listNews.length - 1 ? "border-b border-divider-token" : ""}`}
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-caption uppercase tracking-widest text-text-muted">
                    {item.date}
                  </p>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
