import { createRootRoute, HeadContent, Outlet, Scripts, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  PaperReaderModal,
  FocusAreaModal,
  BioModal,
} from '../components/Modals'
import { LabProvider, useLab } from '@/lab-context'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Human AI Lab' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <LabProvider>
      <RootContent />
    </LabProvider>
  )
}

function RootContent() {
  const navigate = useNavigate()
  const {
    selectedPaper, setSelectedPaper,
    selectedFocusArea, setSelectedFocusArea,
    selectedMember, setSelectedMember,
    handleNavigate,
  } = useLab()

  return (
    <>
      <HeadContent />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-sm focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-background flex flex-col text-on-background relative selection:bg-primary/20 selection:text-primary" id="app-root">
        <Header
          onContactClick={() => navigate({ to: '/contact' })}
          onSearchClick={() => handleNavigate('rounded-publications')}
          onNavigate={handleNavigate}
        />
        <main className="flex-1" id="main-content">
          <Outlet />
        </main>
        <Footer
          onNavigate={handleNavigate}
          onContactClick={() => navigate({ to: '/contact' })}
        />
      </div>

      {selectedPaper && (
        <PaperReaderModal
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      )}
      {selectedFocusArea && (
        <FocusAreaModal
          area={selectedFocusArea}
          onClose={() => setSelectedFocusArea(null)}
          onViewPublications={() => handleNavigate('rounded-publications')}
        />
      )}
      {selectedMember && (
        <BioModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
      <Scripts />
    </>
  )
}
