import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Publication, FocusArea, TeamMember } from '@/types'

interface LabContextType {
  selectedPaper: Publication | null
  setSelectedPaper: (p: Publication | null) => void
  selectedFocusArea: FocusArea | null
  setSelectedFocusArea: (f: FocusArea | null) => void
  selectedMember: TeamMember | null
  setSelectedMember: (t: TeamMember | null) => void
  handleNavigate: (sectionId: string) => void
}

const LabContext = createContext<LabContextType | null>(null)

export function LabProvider({ children }: { children: ReactNode }) {
  const [selectedPaper, setSelectedPaper] = useState<Publication | null>(null)
  const [selectedFocusArea, setSelectedFocusArea] = useState<FocusArea | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  return (
    <LabContext.Provider value={{
      selectedPaper, setSelectedPaper,
      selectedFocusArea, setSelectedFocusArea,
      selectedMember, setSelectedMember,
      handleNavigate
    }}>
      {children}
    </LabContext.Provider>
  )
}

export function useLab() {
  const ctx = useContext(LabContext)
  if (!ctx) throw new Error('useLab must be used within LabProvider')
  return ctx
}
