import { createFileRoute } from '@tanstack/react-router'
import { Target, Users, Lightbulb, ShieldCheck, Microscope, Database, BrainCircuit, Milestone } from 'lucide-react'
import { useLab } from '@/lab-context'
import MembersSection from '@/components/sections/home/MembersSection'
import PillarCard from '@/components/sections/about/PillarCard'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { setSelectedMember } = useLab()
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

  const methodology = [
    {
      title: 'Empirical Observation',
      icon: Microscope,
      text: 'We begin by studying human-environment interactions through rigorous ethnographic and quantitative observation, capturing behavioral baselines before any algorithmic intervention.'
    },
    {
      title: 'Data Synthesization',
      icon: Database,
      text: 'Our engineering teams construct heavily curated, localized datasets. We actively filter for cultural nuances and historical biases to ensure our foundation models reflect our target demographics.'
    },
    {
      title: 'Algorithmic Prototyping',
      icon: BrainCircuit,
      text: 'We develop custom neural architectures and heuristic models that prioritize explainability and bounded safety parameters over unchecked predictive power.'
    },
    {
      title: 'Iterative Deployment',
      icon: Milestone,
      text: 'Prototypes are deployed in closed-loop "sandbox" environments where human interaction is continuously monitored, allowing us to adjust for cognitive load and user trust in real-time.'
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Massive Hero Section */}
      <section className="w-full relative bg-surface border-b border-outline overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary blur-[150px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-4xl">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-6 block border border-primary/30 bg-primary/10 w-fit px-3 py-1 rounded-full">
              ABOUT THE AIM LAB
            </span>
            <h1 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-on-background leading-[0.9] uppercase">
              Designing the future of human-machine interaction.
            </h1>
          </div>
          <div className="max-w-sm">
            <p className="font-sans text-lg text-on-background/70 leading-[1.6]">
              Located in the heart of Sri Lanka's premier technological university, we are dedicated to building artificially intelligent systems that inherently understand and respect human values.
            </p>
          </div>
        </div>
      </section>

      {/* Origin & Philosophy */}
      <section className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase mb-8">
              Our Origin
            </h2>
            <div className="w-full aspect-[4/3] bg-surface-dim border border-outline rounded-2xl overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" 
                alt="Lab research team collaborating" 
                className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 mix-blend-luminosity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/10" />
            </div>
          </div>
          
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="space-y-6 text-on-background/80 leading-[1.8] font-sans text-lg mb-12">
              <p>
                Founded with the vision to bridge the growing gap between rapid AI advancement and human adaptability, AIM Lab began as an interdisciplinary collective. We recognized early on that the most profound challenges in computing were no longer just algorithmic—they were psychological, sociological, and ethical.
              </p>
              <p>
                Today, we operate at the bleeding edge of cognitive modeling and socio-technical systems, bringing together software engineers, interaction designers, and behavioral scientists under one roof. Our mission is not just to make machines smarter, but to make them safer and more collaborative.
              </p>
            </div>
            
            <div className="bg-surface p-10 rounded-2xl border-l-4 border-primary">
              <span className="font-mono text-[10px] font-black tracking-widest text-primary uppercase mb-4 block">
                THE LAB DIRECTIVE
              </span>
              <blockquote className="font-sans text-2xl md:text-3xl font-bold tracking-tight leading-[1.3] text-on-background uppercase">
                "We don't just ask what AI can do. We ask what it should do, and how it makes us feel when it does it."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4 block">
            HOW WE WORK
          </span>
          <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase mb-6">
            Our Research Methodology
          </h2>
          <p className="font-sans text-lg text-on-background/60 leading-[1.6]">
            Every project at the AIM Lab undergoes a rigorous, four-step lifecycle designed to guarantee ethical integrity and functional reliability before public deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {methodology.map((step, idx) => (
            <div key={idx} className="flex gap-6 p-8 bg-surface border border-outline rounded-2xl group hover:border-primary/50 transition-colors">
              <div className="flex-shrink-0 w-16 h-16 bg-background border border-outline rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8" />
              </div>
              <div>
                <span className="font-mono text-xs font-black text-on-background/40 tracking-widest mb-1 block">
                  PHASE 0{idx + 1}
                </span>
                <h3 className="font-sans text-2xl font-black uppercase tracking-tight text-on-background mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-on-background/70 leading-[1.7]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4 block">
              OUR FRAMEWORK
            </span>
            <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase">
              Core Pillars
            </h2>
          </div>
          <p className="font-sans text-base text-on-background/60 leading-[1.6] max-w-sm">
            These four foundational principles guide every experiment, publication, and prototype generated by the lab.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.title} title={pillar.title} icon={pillar.icon} description={pillar.description} />
          ))}
        </div>
      </section>

      <MembersSection
        onSelectMember={(member) => setSelectedMember(member)}
      />

      {/* Final CTA / Statement */}
      <section className="max-w-7xl mx-auto px-6 mt-28">
        <div className="bg-primary p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-sans text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.95] mb-8">
              Let's build a predictable future together.
            </h2>
            <p className="font-sans text-lg md:text-xl text-white/80 font-medium mb-12">
              Whether you're a prospective PhD student, an industry partner, or a fellow researcher, we're always open to collaboration.
            </p>
            <button className="bg-white text-primary font-sans font-black uppercase tracking-wider px-8 py-4 rounded-full hover:bg-black hover:text-white transition-colors">
              Contact the Lab
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
