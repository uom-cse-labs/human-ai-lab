import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllProjects } from '@/lib/projects'
import type { ProjectIndexItem } from '@/lib/projects'
import ProjectCard from '@/components/ProjectCard'
import { ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const projects = getAllProjects()
  const featured = projects[0]
  const rest = projects.slice(1)

  return (
    <main className="min-h-screen bg-background pb-28">
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-1/2 h-full bg-primary blur-[150px] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col gap-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/10 w-fit px-3 py-1 rounded-full">
            LABORATORY PROJECTS
          </span>
          <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase max-w-5xl">
            Research in Action
          </h1>
          <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] max-w-3xl mt-4">
            Explore the lab's active research projects spanning AI governance, healthcare ethics, and agricultural technology for the Global South.
          </p>
        </div>
      </section>

      {featured && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-8 border-b border-outline pb-4">
            FEATURED PROJECT
          </h2>
          <Link
            to="/projects/$slug"
            params={{ slug: featured.slug }}
            className="group flex flex-col lg:flex-row gap-8 lg:gap-16 items-center bg-surface border border-outline rounded-3xl p-6 md:p-8 hover:border-primary/50 transition-colors"
          >
            <div className="w-full lg:w-3/5 overflow-hidden rounded-2xl relative aspect-[16/9] lg:aspect-[4/3]">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="w-full lg:w-2/5 flex flex-col justify-center">
              <span className="font-mono text-xs font-black text-primary tracking-[0.2em] uppercase mb-4 block">
                {featured.date}
              </span>
              <h3 className="font-sans text-4xl md:text-5xl font-black text-on-background tracking-tight leading-[1.1] uppercase mb-6 group-hover:text-primary transition-colors">
                {featured.title}
              </h3>
              <p className="font-sans text-lg text-on-background/70 leading-[1.6] font-normal mb-8">
                {featured.content}
              </p>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-on-background group-hover:text-primary transition-colors">
                EXPLORE PROJECT <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase mb-8 border-b border-outline pb-4">
            ALL PROJECTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rest.map((item: ProjectIndexItem) => (
              <ProjectCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
