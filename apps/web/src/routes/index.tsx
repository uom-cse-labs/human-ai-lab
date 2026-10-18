import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { titled } from '@/lib/title'
import { useLab } from '@/lab-context'
import type { FocusArea } from '@/types'

import HeroSection from '@/components/sections/home/HeroSection'
import MissionSection from '@/components/sections/home/MissionSection'
import ResearchThemesSection from '@/components/sections/home/ResearchThemesSection'
import PublicationsSection from '@/components/sections/home/PublicationsSection'
import LeadershipSection from '@/components/sections/home/LeadershipSection'
import NewsSection from '@/components/sections/home/NewsSection'

export const Route = createFileRoute('/')({
  head: titled(),
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
      <NewsSection />
      <MissionSection />
      <ResearchThemesSection
        onSelectArea={handleSelectAreaFromModal}
        onViewAllClick={() => navigate({ to: '/themes' })}
      />
      <PublicationsSection
        onReadPaper={(paper) => navigate({ to: '/publications/$id', params: { id: paper.id } })}
        onViewAllClick={() => navigate({ to: '/publications' })}
      />
      <LeadershipSection />
    </>
  )
}
