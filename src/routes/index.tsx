import { createFileRoute } from '@tanstack/react-router'

import HeroSection from '@/components/sections/home/HeroSection'
import AboutSection from '@/components/sections/home/AboutSection'
import MissionSection from '@/components/sections/home/MissionSection'
import ResearchThemesSection from '@/components/sections/home/ResearchThemesSection'
import FeaturedResearchSection from '@/components/sections/home/FeaturedResearchSection'
import PublicationsSection from '@/components/sections/home/PublicationsSection'
import MembersSection from '@/components/sections/home/MembersSection'
import EquipmentSection from '@/components/sections/home/EquipmentSection'
import NewsSection from '@/components/sections/home/NewsSection'
import StatisticsSection from '@/components/sections/home/StatisticsSection'
import CollaborationSection from '@/components/sections/home/CollaborationSection'
import ContactSection from '@/components/sections/home/ContactSection'

export const Route = createFileRoute('/')({
  component: Home,
})

const aboutParagraphs = [
  'The Human-AI Lab is an academic research laboratory within the Department of Computer Science and Engineering at the University of Moratuwa. Our work focuses on understanding the relationship between humans and intelligent systems while developing AI technologies that are practical, trustworthy, and beneficial.',
  'The lab brings together faculty members, postgraduate researchers, and undergraduate students to conduct research spanning machine learning, human-computer interaction, natural language processing, explainable AI, and emerging intelligent technologies.',
  'As the lab grows, it aims to foster interdisciplinary research, contribute to open scientific knowledge, and strengthen collaboration between academia and industry.',
]

const researchThemes = [
  {
    title: 'Human-Centered AI',
    description:
      'Designing AI systems that complement human abilities, improve decision-making, and prioritize usability and accessibility.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Explainable AI',
    description:
      'Developing techniques that help people understand, trust, and effectively interact with machine learning models.',
    image:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Natural Language Technologies',
    description:
      'Building intelligent systems capable of understanding and generating human language across diverse applications.',
    image:
      'https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Human-Computer Interaction',
    description:
      'Investigating how people engage with intelligent technologies and creating interfaces that improve collaboration between humans and AI.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Responsible AI',
    description:
      'Exploring fairness, transparency, privacy, and ethical considerations throughout the AI development lifecycle.',
    image:
      'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Intelligent Decision Support',
    description:
      'Applying AI to assist professionals and organizations in making informed, data-driven decisions.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop',
  },
]

const featuredResearch = [
  {
    title: 'Adaptive Learning Systems',
    description:
      'Investigating intelligent educational technologies that personalize learning experiences using data-driven approaches.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Explainable Clinical Decision Support',
    description:
      'Studying methods for presenting machine learning recommendations in healthcare environments while maintaining transparency and trust.',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'AI for Sustainable Development',
    description:
      'Exploring AI applications that address environmental monitoring, resource optimization, and sustainable communities.',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe0c?w=600&q=80&auto=format&fit=crop',
  },
]

const publications = [
  {
    title: 'Learning Human Preferences for Explainable Recommendation Systems',
    venue: 'Conference on Intelligent User Interfaces',
    year: '2026',
    description:
      'A study investigating how explanation styles influence user confidence and decision quality in recommendation systems.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Improving Human Trust in AI-Assisted Decision Making',
    venue: 'Journal of Human-Centered AI',
    year: '2025',
    description:
      'An evaluation of transparency techniques designed to improve collaboration between people and intelligent systems.',
    image:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Interactive Machine Learning for Education',
    venue: 'International Conference on Artificial Intelligence in Education',
    year: '2025',
    description:
      'Research examining how interactive AI tools can support instructors and students in higher education.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Responsible Language Models for Low-Resource Languages',
    venue: 'Computational Linguistics Workshop',
    year: '2024',
    description:
      'Exploring methods for developing language technologies that are accurate, transparent, and inclusive.',
    image:
      'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=200&q=80&auto=format&fit=crop',
  },
]

const newsItems = [
  {
    date: 'JUN 2025',
    title: 'New Research Publication Accepted',
    description:
      'A research publication by members of the Human-AI Lab has been accepted at an international conference focusing on trustworthy artificial intelligence.',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop',
    featured: true,
  },
  {
    date: 'MAY 2025',
    title: 'Undergraduate Research Opportunities',
    description:
      'Applications are now open for undergraduate students interested in joining ongoing research projects.',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&q=80&auto=format&fit=crop',
    featured: false,
  },
  {
    date: 'APR 2025',
    title: 'Workshop on Human-Centered AI',
    description:
      'The lab hosted an academic workshop introducing students to current challenges in explainable and responsible AI.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&q=80&auto=format&fit=crop',
    featured: false,
  },
]

const statistics = [
  { value: '20+', label: 'Active Research Projects' },
  { value: '50+', label: 'Research Publications' },
  { value: '15', label: 'Lab Members' },
  { value: '10+', label: 'International Research Partnerships' },
  { value: '8', label: 'Research Themes' },
  { value: '5', label: 'Annual Student Projects' },
]

const equipmentItems = [
  'High-performance GPU workstations',
  'Multi-monitor research workstations',
  'Embedded AI development kits',
  'Mobile devices for usability studies',
  'Virtual reality headsets',
  'Eye-tracking equipment',
  'AI inference servers',
  'Networked computing infrastructure',
]

const collaborationAreas = [
  'Joint Research Projects',
  'Student Supervision',
  'Industry-Funded Research',
  'Technology Transfer',
  'Guest Lectures & Workshops',
  'Research Internships',
]

function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <AboutSection paragraphs={aboutParagraphs} />
      <MissionSection />
      <ResearchThemesSection themes={researchThemes} />
      <FeaturedResearchSection projects={featuredResearch} />
      <PublicationsSection publications={publications} />
      <MembersSection />
      <EquipmentSection items={equipmentItems} />
      <NewsSection news={newsItems} />
      <StatisticsSection stats={statistics} />
      <CollaborationSection areas={collaborationAreas} />
      <ContactSection />
    </main>
  )
}
