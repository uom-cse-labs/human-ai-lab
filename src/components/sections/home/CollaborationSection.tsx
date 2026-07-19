import SectionHeader from "@/components/sections/SectionHeader"

interface CollaborationSectionProps {
  areas: string[]
}

export default function CollaborationSection({
  areas,
}: CollaborationSectionProps) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-border-token">
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
                <span
                  key={area}
                  className="rounded-full border border-border-token bg-bg-secondary px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-brand/30 hover:bg-bg-muted hover:text-brand"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
