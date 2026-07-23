import { createFileRoute } from '@tanstack/react-router'
import ContactSection from '@/components/sections/home/ContactSection'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ContactSection />
}
