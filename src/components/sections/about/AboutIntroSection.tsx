import SectionHeader from "@/components/sections/SectionHeader"

interface Stat {
  label: string
  value: string
}

interface AboutIntroSectionProps {
  stats: Stat[]
}

export default function AboutIntroSection({
  stats,
}: AboutIntroSectionProps) {
  return (
    <section className="relative bg-surface pt-24">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      <div className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <SectionHeader title="About the Lab" as="h1" />
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-lead leading-relaxed text-on-background/60">
              The Human-AI Lab is a research group based at the University of
              Moratuwa, Sri Lanka's premier engineering university. We conduct
              interdisciplinary research at the intersection of artificial
              intelligence, human-computer interaction, and social impact.
            </p>
            <p className="mt-6 text-base leading-relaxed text-on-background/60">
              Founded in 2020, our lab brings together computer scientists,
              engineers, ethicists, and domain experts to build AI systems
              that are technically robust, socially aware, and culturally
              appropriate. We are committed to open science, reproducible
              research, and training the next generation of AI researchers in
              the Global South.
            </p>
            <p className="mt-6 text-base leading-relaxed text-on-background/60">
              Our work has been published at top venues including CHI, AAAI,
              ICLR, and FAccT, and our collaborations span academic
              institutions, government agencies, and industry partners across
              Asia, Europe, and North America.
            </p>
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
            <div className="mt-8 rounded-3xl bg-surface-dim p-8">
              <span className="text-caption font-semibold uppercase tracking-widest text-on-background/40">
                By the Numbers
              </span>
              <div className="mt-6 grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <span className="text-3xl font-bold text-primary">
                      {stat.value}
                    </span>
                    <p className="mt-1 text-sm text-on-background/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
