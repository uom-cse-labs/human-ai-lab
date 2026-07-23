import SectionHeader from "@/components/sections/SectionHeader"

interface Project {
  title: string
  description: string
  image: string
}

interface FeaturedResearchSectionProps {
  projects: Project[]
}

export default function FeaturedResearchSection({
  projects,
}: FeaturedResearchSectionProps) {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader
          title="Featured Research"
          description="Current research projects exploring the frontiers of human-centered artificial intelligence."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.title}
              className="overflow-hidden rounded-3xl border border-outline bg-surface-dim"
            >
              <img
                src={project.image}
                alt=""
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
              <div className="p-8">
                <h3 className="text-xl font-semibold text-on-background">
                  {project.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-on-background/60">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
