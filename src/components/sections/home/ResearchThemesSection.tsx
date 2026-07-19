import SectionHeader from "@/components/sections/SectionHeader"

interface Theme {
  title: string
  description: string
  image: string
}

interface ResearchThemesSectionProps {
  themes: Theme[]
}

export default function ResearchThemesSection({
  themes,
}: ResearchThemesSectionProps) {
  return (
    <section id="research-themes" className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Research Themes" />
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div
              key={theme.title}
              className="overflow-hidden rounded-3xl border border-border-token bg-white transition-colors duration-200 hover:bg-bg-muted"
            >
              <img
                src={theme.image}
                alt=""
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  {theme.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  {theme.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-widest text-brand transition-all hover:gap-3">
                  Learn More
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
