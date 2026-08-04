import { createRootRoute, HeadContent, Scripts, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
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
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <LabProvider>
          <RootContent>{children}</RootContent>
        </LabProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootContent({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const {
    selectedFocusArea, setSelectedFocusArea,
    selectedMember, setSelectedMember,
    handleNavigate,
  } = useLab()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-sm focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-background flex flex-col text-on-background relative selection:bg-primary/20 selection:text-primary" id="app-root">
        <Header
          onContactClick={() => navigate({ to: '/contact' })}
          onSearchClick={() => navigate({ to: '/publications', search: { openSearch: true }, hash: 'search' })}
          onNavigate={handleNavigate}
        />
        <main className="flex-1" id="main-content">
          {children}
        </main>
        <Footer
          onContactClick={() => navigate({ to: '/contact' })}
        />
      </div>

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
    </>
  )
}