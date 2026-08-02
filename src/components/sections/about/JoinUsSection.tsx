import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/sections/SectionHeader"

export default function JoinUsSection() {
  return (
    <section className="relative bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
        <SectionHeader
          title="Join Our Team"
          centered
          description="We are always looking for passionate researchers, engineers, and collaborators. If you are interested in human-centered AI, reach out to us."
        />
        <div className="mt-10">
          <Button className="px-8 text-base">Get in Touch</Button>
        </div>
      </div>
    </section>
  )
}
