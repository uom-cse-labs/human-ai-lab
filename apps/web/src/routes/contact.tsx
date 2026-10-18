import { createFileRoute } from '@tanstack/react-router'
import { titled } from '@/lib/title'
import ContactSection from '@/components/sections/home/ContactSection'

export const Route = createFileRoute('/contact')({
  head: titled('Contact'),
  component: RouteComponent,
})

function RouteComponent() {
  return <ContactSection />
}
