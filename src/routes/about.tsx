import { createFileRoute } from '@tanstack/react-router'
import { Target, Users, Lightbulb, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const pillars = [
    {
      title: 'Human-Centricity',
      icon: Users,
      description: 'We prioritize the human experience, ensuring technology adapts to people rather than forcing people to adapt to machines.'
    },
    {
      title: 'Ethical Foundations',
      icon: ShieldCheck,
      description: 'Our research embeds fairness, transparency, and accountability into the core architecture of intelligent systems.'
    },
    {
      title: 'Cognitive Synergy',
      icon: Lightbulb,
      description: 'We explore the intersection of human cognition and artificial intelligence to create systems that augment rather than replace human capabilities.'
    },
    {
      title: 'Actionable Impact',
      icon: Target,
      description: 'Beyond theoretical papers, we build functional prototypes that solve real-world problems in healthcare, education, and industry.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-20 border-b border-outline">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
          WHO WE ARE
        </span>
        <h1 className="font-sans text-5xl md:text-7xl font-black tracking-tighter text-on-background mt-4 leading-[0.9] uppercase max-w-4xl">
          Designing the future of human-machine interaction.
        </h1>
        <p className="font-sans text-lg md:text-xl text-on-background/60 leading-[1.6] mt-10 max-w-3xl">
          AIM Lab is a premier research group based at the University of Moratuwa. We are dedicated to exploring, designing, and building the next generation of artificially intelligent systems that inherently understand and respect human values.
        </p>
      </section>

      {/* Origin & Philosophy */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 border-b border-outline">
        <div>
          <h2 className="font-sans text-3xl md:text-4xl font-black tracking-tighter text-on-background uppercase mb-8">
            Our Origin
          </h2>
          <div className="space-y-6 text-on-background/70 leading-[1.8] font-sans">
            <p>
              Founded with the vision to bridge the growing gap between rapid AI advancement and human adaptability, AIM Lab began as an interdisciplinary collective. We recognized that the most profound challenges in computing were no longer just algorithmic—they were psychological, sociological, and ethical.
            </p>
            <p>
              Today, we operate at the bleeding edge of cognitive modeling and socio-technical systems, bringing together engineers, designers, and behavioral scientists under one roof in Sri Lanka.
            </p>
          </div>
        </div>
        <div className="bg-surface p-12 rounded-2xl border border-outline flex flex-col justify-center">
          <h2 className="font-sans text-2xl font-black tracking-tight text-[#F27D26] uppercase mb-6">
            The Philosophy
          </h2>
          <blockquote className="font-sans text-2xl leading-[1.4] text-on-background italic">
            "We don't just ask what AI can do. We ask what it should do, and how it makes us feel when it does it."
          </blockquote>
          <span className="font-mono text-xs font-bold tracking-widest uppercase mt-8 text-on-background/50">
            — AIM LAB DIRECTIVE
          </span>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#F27D26] mb-4 block">
          OUR FRAMEWORK
        </span>
        <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase mb-16">
          Core Pillars
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="group flex flex-col p-8 bg-surface border border-outline hover:border-[#F27D26]/50 transition-colors rounded-2xl">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-container text-[#F27D26] border border-outline rounded-xl mb-8 group-hover:scale-110 transition-transform">
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="font-sans text-xl font-black uppercase tracking-tight text-on-background mb-4">
                {pillar.title}
              </h3>
              <p className="font-sans text-sm text-on-background/60 leading-[1.6]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA / Statement */}
      <section className="bg-[#F27D26] py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-sans text-4xl md:text-6xl font-black tracking-tighter text-black uppercase leading-none mb-8">
            Let's build a predictable future together.
          </h2>
          <p className="font-sans text-lg text-black/80 max-w-2xl mx-auto mb-12">
            Whether you're a prospective PhD student, an industry partner, or a fellow researcher, we're always open to collaboration.
          </p>
        </div>
      </section>
    </div>
  )
}
