import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/sections/SectionHeader"

export default function ContactSection() {
  return (
    <section className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
        <SectionHeader
          title="Get in Touch"
          centered
          description="Interested in our research or exploring opportunities to work with the Human-AI Lab?"
        />
        <p className="mt-6 text-base text-text-muted">
          Official contact information will be added once available.
        </p>
        <div className="mt-10">
          <Button className="px-8 text-base">Contact Us</Button>
        </div>
      </div>
    </section>
  )
}
