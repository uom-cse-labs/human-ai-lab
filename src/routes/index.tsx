import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLab } from '@/lab-context'
import type { FocusArea } from '@/types'

import HeroSection from '@/components/sections/home/HeroSection'
import MissionSection from '@/components/sections/home/MissionSection'
import ResearchThemesSection from '@/components/sections/home/ResearchThemesSection'
import PublicationsSection from '@/components/sections/home/PublicationsSection'
import MembersSection from '@/components/sections/home/MembersSection'
import NewsSection from '@/components/sections/home/NewsSection'
import ContactSection from '@/components/sections/home/ContactSection'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const {
    setSelectedFocusArea,
    handleNavigate,
  } = useLab()

  const handleSelectAreaFromModal = (area: FocusArea) => {
    setSelectedFocusArea(area)
  }

  return (
    <>
      <HeroSection
        onExploreResearch={() => handleNavigate('rounded-focus-areas')}
        onViewPublications={() => handleNavigate('rounded-publications')}
      />
      <MissionSection />
      <ResearchThemesSection
        onSelectArea={handleSelectAreaFromModal}
        onViewAllClick={() => navigate({ to: '/themes' })}
      />
      <PublicationsSection
        onReadPaper={() => navigate({ to: '/publications' })}
        onViewAllClick={() => navigate({ to: '/publications' })}
      />
      <MembersSection />
      <NewsSection />
      <ContactSection />
    </>
  )
}
