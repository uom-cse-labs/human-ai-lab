import SectionHeader from "@/components/sections/SectionHeader"

interface EquipmentSectionProps {
  items: string[]
}

export default function EquipmentSection({ items }: EquipmentSectionProps) {
  return (
    <section className="bg-surface-dim py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Physical Lab Equipment" />
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-outline">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80&auto=format&fit=crop"
                alt="Research laboratory equipment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lead leading-relaxed text-on-background/60">
              The Human-AI Lab is developing a collection of computing
              resources and specialized hardware to support research
              activities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-outline bg-background px-5 py-3 text-sm text-on-background/60 transition-colors duration-200 hover:border-primary/30 hover:text-primary"
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
