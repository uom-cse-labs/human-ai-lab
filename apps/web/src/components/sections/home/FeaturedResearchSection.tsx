import SectionHeader from "@/components/sections/SectionHeader"
import ProjectCard from "./ProjectCard"

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
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
