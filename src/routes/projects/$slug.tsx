import { createFileRoute, Link } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { getAllProjects, getProjectBody } from "@/lib/projects";
import { ArrowLeft, Twitter, Linkedin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const projects = getAllProjects();
  const project = projects.find((p) => p.slug === slug) ?? null;
  const body = project ? getProjectBody(slug) : null;

  if (!project || !body) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="font-sans text-2xl font-black text-on-background mb-4">
          Project Not Found
        </h1>
        <Link to="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="w-full h-[40vh] relative overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end max-w-3xl mx-auto px-6 pb-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors mb-6 w-fit bg-surface-container px-4 py-2 rounded-full border border-outline backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> LABORATORY PROJECTS
          </Link>
          <div>
            <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95] mb-4">
              {project.title}
            </h1>
            <span className="font-mono text-xs font-black text-white/60 tracking-[0.2em] uppercase">
              {project.date}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <Markdown>{body}</Markdown>
        </div>

        <div className="flex items-center gap-3 mt-16 pt-8 border-t border-outline">
          <span className="font-mono text-[10px] font-black text-on-background/40 tracking-[0.2em] uppercase">
            SHARE
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-outline hover:border-primary hover:text-primary w-8 h-8"
              disabled={!project.share?.twitter}
              onClick={() => project.share?.twitter && window.open(project.share.twitter, '_blank', 'noopener,noreferrer')}
            >
              <Twitter className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-outline hover:border-primary hover:text-primary w-8 h-8"
              disabled={!project.share?.linkedin}
              onClick={() => project.share?.linkedin && window.open(project.share.linkedin, '_blank', 'noopener,noreferrer')}
            >
              <Linkedin className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-outline hover:border-primary hover:text-primary w-8 h-8"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
