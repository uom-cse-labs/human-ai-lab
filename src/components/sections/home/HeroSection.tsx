import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 z-20 h-1 bg-brand" />
      <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1573164574472-797cdf4a583a?w=1440&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="relative z-10 px-8 py-20 lg:px-16 lg:py-28">
            <p className="text-caption uppercase tracking-widest text-white/65">
              Human-AI Lab — University of Moratuwa
            </p>
            <h1 className="mt-4 max-w-4xl text-hero font-bold leading-tight text-white lg:text-6xl">
              Human-Centered Artificial Intelligence for Real-World Impact
            </h1>
            <p className="mt-6 max-w-2xl text-lead leading-relaxed text-white/80">
              The Human-AI Lab at the University of Moratuwa explores how
              artificial intelligence can be designed, evaluated, and deployed
              to support people, organizations, and society through
              responsible, transparent, and human-centered research.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="px-8 text-base"
                onClick={() =>
                  document
                    .getElementById("research-themes")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Research
              </Button>
              <Button
                variant="light"
                className="px-8 text-base"
                onClick={() =>
                  document
                    .getElementById("publications")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Publications
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
