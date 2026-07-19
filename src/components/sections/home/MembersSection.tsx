import SectionHeader from "@/components/sections/SectionHeader"

export default function MembersSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Meet Our Lab Members" />
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-3xl border border-border-token bg-bg-secondary p-8 lg:col-span-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="size-24 shrink-0 overflow-hidden rounded-full border-2 border-brand/20">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&q=80&auto=format&fit=crop"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-caption font-semibold uppercase tracking-widest text-text-muted">
                  Lab Director
                </span>
                <h3 className="mt-2 text-xl font-semibold text-neutral-900">
                  Eng. Prof. Indika Perera, PhD (St Andrews), CEng
                </h3>
                <p className="mt-1 text-base text-text-secondary">
                  Professor, Department of Computer Science and Engineering
                </p>
                <p className="mt-4 text-base leading-relaxed text-text-secondary">
                  Research interests include human-centered AI, machine
                  learning, software engineering, and intelligent systems.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-3xl border border-border-token p-8 transition-colors duration-200 hover:bg-bg-muted">
              <span className="text-caption font-semibold uppercase tracking-widest text-text-muted">
                Faculty
              </span>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                Short profiles introducing academic staff affiliated with the
                Human-AI Lab.
              </p>
            </div>
            <div className="rounded-3xl border border-border-token p-8 transition-colors duration-200 hover:bg-bg-muted">
              <span className="text-caption font-semibold uppercase tracking-widest text-text-muted">
                Postgraduate Researchers
              </span>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                MSc and PhD researchers working on ongoing research projects
                across multiple AI disciplines.
              </p>
            </div>
            <div className="rounded-3xl border border-border-token p-8 transition-colors duration-200 hover:bg-bg-muted">
              <span className="text-caption font-semibold uppercase tracking-widest text-text-muted">
                Undergraduate Research Assistants
              </span>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                Students contributing to active research through software
                development, experimentation, literature reviews, and data
                analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
