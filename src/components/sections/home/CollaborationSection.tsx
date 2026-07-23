import SectionHeader from "@/components/sections/SectionHeader"
import CollaborationPill from "./CollaborationPill"

interface CollaborationSectionProps {
  areas: string[]
}

export default function CollaborationSection({
  areas,
}: CollaborationSectionProps) {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-outline">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80&auto=format&fit=crop"
                alt="Collaborative team discussion"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader
              title="Working Together"
              description="The Human-AI Lab welcomes opportunities to work with academic institutions, industry organizations, government agencies, and research communities interested in advancing human-centered artificial intelligence."
            />
            <div className="mt-10 flex flex-wrap gap-3">
              {areas.map((area) => (
                <CollaborationPill key={area} label={area} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
