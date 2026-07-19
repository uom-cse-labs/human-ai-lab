import SectionHeader from "@/components/sections/SectionHeader"

export default function MissionSection() {
  return (
    <section className="relative bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80&auto=format&fit=crop"
                alt="Abstract representation of artificial intelligence"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-brand/10" />
            </div>
          </div>
          <div className="flex flex-col justify-center lg:col-span-6">
            <SectionHeader title="Mission Statement" />
            <blockquote className="mt-8 border-l-4 border-brand pl-8">
              <p className="text-2xl leading-relaxed italic text-text-secondary">
                To advance human-centered artificial intelligence through
                impactful research, responsible innovation, and education that
                empowers people and society.
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
