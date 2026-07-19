import SectionHeader from "@/components/sections/SectionHeader"

interface Publication {
  title: string
  venue: string
  year: string
  description: string
  image: string
}

interface PublicationsSectionProps {
  publications: Publication[]
}

export default function PublicationsSection({
  publications,
}: PublicationsSectionProps) {
  return (
    <section id="publications" className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Recent Research Publications" />
        <div className="mt-12 space-y-6">
          {publications.map((pub) => (
            <div
              key={pub.title}
              className="flex items-start gap-6 rounded-2xl border border-border-token bg-white p-6 transition-colors duration-200 hover:bg-bg-muted"
            >
              <div className="size-24 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={pub.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-neutral-900">
                  {pub.title}
                </h3>
                <p className="mt-1 text-caption uppercase tracking-widest text-brand">
                  {pub.venue} &middot; {pub.year}
                </p>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  {pub.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
