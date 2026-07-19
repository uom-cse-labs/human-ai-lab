import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-5xl font-bold text-neutral-900">About</h1>
      <p className="mt-4 text-lg text-neutral-500">About page</p>
    </main>
  )
}
