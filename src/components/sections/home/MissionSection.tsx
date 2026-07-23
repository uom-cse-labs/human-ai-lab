import MissionStat from './MissionStat';

export default function MissionSection() {
  const stats = [
    { value: '12+', label: 'ACTIVE PROJECTS' },
    { value: '45', label: 'PUBLICATIONS' },
    { value: '08', label: 'PHD FELLOWS' },
  ];

  return (
    <section
      id="rounded-mission"
      className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-12 gap-16 border-b border-outline"
    >
      <div className="lg:col-span-4">
        <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background leading-[1.1] uppercase select-none">
          Pioneering ethical AI for a human-centric future.
        </h2>
      </div>

      <div className="lg:col-span-8 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6">
            <p className="font-sans text-base text-on-background/60 leading-[1.7] font-normal">
              Located in the heart of Sri Lanka's premier technological university, Human-Centered AI (AIM) is dedicated to ensuring that the next generation of intelligent systems serves the needs of people and society.
            </p>
            <p className="font-sans text-base text-on-background/60 leading-[1.7] font-normal">
              Our mission is to investigate how AI interacts with human behavior, culture, and ethics. We don't just build faster algorithms; we design systems that are transparent, fair, and deeply integrated with human decision-making processes.
            </p>
          </div>
          <div>
            <p className="font-sans text-base text-on-background/60 leading-[1.7] font-normal">
              Through interdisciplinary collaboration across computer science, psychology, and design, our researchers are tackling the most pressing challenges of our digital age—from bias in automated hiring to the cognitive impact of social robotics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-12 border-t border-outline">
          {stats.map((stat, i) => (
            <MissionStat key={i} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
