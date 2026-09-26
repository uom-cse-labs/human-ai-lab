interface Project {
  title: string
  description: string
  image: string
}

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-outline bg-surface-dim">
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
  )
}
