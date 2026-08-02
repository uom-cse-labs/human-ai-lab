import MissionStat from './MissionStat';

export default function MissionSection() {
  const stats = [
    { value: '10+', label: 'ACTIVE PROJECTS' },
    { value: '50+', label: 'PUBLICATIONS' },
    { value: '08', label: 'RESEARCH FELLOWS' },
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
              HumanAI Research Lab is dedicated to advancing the frontiers of human-centered AI through interdisciplinary research, technological innovation, and collaborative exploration. We aim to develop trustworthy AI systems that enhance human capabilities, solve complex challenges, and create meaningful impact across diverse domains.
            </p>
          </div>
          <div>
            <p className="font-sans text-base text-on-background/60 leading-[1.7] font-normal">
              HumanAI Research Lab envisions a future where AI technologies are designed with humans at the center, enabling inclusive, ethical, and sustainable progress. We strive to become a recognized center of excellence in AI research, education, and innovation, contributing to global advancements while addressing local and societal needs.
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
