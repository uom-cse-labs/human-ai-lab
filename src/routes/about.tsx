import { createFileRoute } from '@tanstack/react-router'

import AboutIntroSection from '@/components/sections/about/AboutIntroSection'
import ResearchAreasSection from '@/components/sections/about/ResearchAreasSection'
import JoinUsSection from '@/components/sections/about/JoinUsSection'

export const Route = createFileRoute('/about')({
  component: About,
})

const stats = [
  { label: 'Active Researchers', value: '15+' },
  { label: 'Publications', value: '80+' },
  { label: 'Active Projects', value: '12' },
  { label: 'Partner Institutions', value: '20+' },
]

const accordionItems = [
  {
    title: 'Responsible AI & Ethics',
    content:
      'Our team develops auditing frameworks and fairness metrics tailored to South Asian contexts, ensuring AI systems deployed in healthcare, finance, and public services are equitable and accountable.',
  },
  {
    title: 'Human-AI Collaboration',
    content:
      'We study how humans interact with AI systems in real-world settings, designing interfaces and feedback loops that build trust and enable effective decision-making.',
  },
  {
    title: 'NLP for Low-Resource Languages',
    content:
      'Focusing on Sinhala and Tamil, we build language models and speech systems that serve linguistically diverse populations, bridging the digital divide.',
  },
  {
    title: 'AI for Social Development',
    content:
      'We partner with government agencies and NGOs to deploy AI solutions in agriculture, public health, and disaster response, with a focus on measurable community impact.',
  },
]

function About() {
  return (
    <main id="main-content">
      <AboutIntroSection stats={stats} />
      <ResearchAreasSection items={accordionItems} />
      <JoinUsSection />
    </main>
  )
}
