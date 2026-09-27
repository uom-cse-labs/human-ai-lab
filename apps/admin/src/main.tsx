import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createRootRoute, createRoute, createRouter, Outlet, redirect, RouterProvider,
} from '@tanstack/react-router'
import { loadSession } from './api/client.ts'
import Layout from './components/Layout.tsx'
import { COLLECTIONS } from './collections.ts'
import CollectionEditorPage from './pages/CollectionEditorPage.tsx'
import CollectionListPage from './pages/CollectionListPage.tsx'
import NewsEditorPage from './pages/NewsEditorPage.tsx'
import NewsListPage from './pages/NewsListPage.tsx'
import MediaLibraryPage from './pages/MediaLibraryPage.tsx'
import ReleasesPage from './pages/ReleasesPage.tsx'
import './styles.css'

const rootRoute = createRootRoute({
  component: () => <Layout><Outlet /></Layout>,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/news' }) },
})
const newsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/news', component: NewsListPage })
const newNewsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/news/new', component: () => <NewsEditorPage /> })
const editNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news/$id',
  component: function EditNews() {
    const { id } = editNewsRoute.useParams()
    return <NewsEditorPage key={id} id={id} />
  },
})
const releasesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/releases', component: ReleasesPage })
// Not /media: that path serves the photo files themselves.
const libraryRoute = createRoute({ getParentRoute: () => rootRoute, path: '/library', component: MediaLibraryPage })

// Publications, research themes and people share one list and one editor, driven by collections.ts.
const findCollection = (section: string) => COLLECTIONS.find((c) => c.path === `/${section}`)
const notFound = <p className="text-muted">There is no such section.</p>

const sectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$section',
  component: function Section() {
    const collection = findCollection(sectionRoute.useParams().section)
    return collection ? <CollectionListPage key={collection.type} collection={collection} /> : notFound
  },
})
const sectionNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$section/new',
  component: function NewEntry() {
    const collection = findCollection(sectionNewRoute.useParams().section)
    return collection ? <CollectionEditorPage key={collection.type} collection={collection} /> : notFound
  },
})
const sectionEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$section/$id',
  component: function EditEntry() {
    const { section, id } = sectionEditRoute.useParams()
    const collection = findCollection(section)
    return collection ? <CollectionEditorPage key={`${collection.type}-${id}`} collection={collection} id={id} /> : notFound
  },
})

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute, newsRoute, newNewsRoute, editNewsRoute, releasesRoute, libraryRoute, sectionRoute, sectionNewRoute, sectionEditRoute,
  ]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Know the signed-in role before the first render, so admin-only actions never flash on screen.
void loadSession().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
