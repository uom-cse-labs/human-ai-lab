import SectionHeader from "@/components/sections/SectionHeader"

interface AboutSectionProps {
  paragraphs: string[]
}

export default function AboutSection({ paragraphs }: AboutSectionProps) {
  return (
    <section className="bg-surface-dim py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="About the Human-AI Lab" />
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-lead leading-relaxed text-on-background/60"
                    : "mt-6 text-base leading-relaxed text-on-background/60"
                }
              >
                {p}
              </p>
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-outline">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80&auto=format&fit=crop"
                alt="University of Moratuwa campus"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
