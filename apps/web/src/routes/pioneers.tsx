import { createFileRoute, redirect } from '@tanstack/react-router'

/** The People page used to be called Pioneers; old links keep working. */
export const Route = createFileRoute('/pioneers')({
  beforeLoad: () => {
    throw redirect({ to: '/people', replace: true })
  },
})
