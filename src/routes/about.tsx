import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main id="main-content" className="max-w-7xl mx-auto px-6 py-28">
      <h1 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background uppercase">
        About
      </h1>
      <p className="font-sans text-base text-on-background/60 leading-[1.7] mt-6 max-w-3xl">
        This page is being updated.
      </p>
    </main>
  )
}
