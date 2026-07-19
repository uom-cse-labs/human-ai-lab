import SectionHeader from "@/components/sections/SectionHeader"

interface EquipmentSectionProps {
  items: string[]
}

export default function EquipmentSection({ items }: EquipmentSectionProps) {
  return (
    <section className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Physical Lab Equipment" />
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-border-token">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80&auto=format&fit=crop"
                alt="Research laboratory equipment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lead leading-relaxed text-text-secondary">
              The Human-AI Lab is developing a collection of computing
              resources and specialized hardware to support research
              activities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border-token bg-white px-5 py-3 text-sm text-text-secondary transition-colors duration-200 hover:border-brand/30 hover:text-brand"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
