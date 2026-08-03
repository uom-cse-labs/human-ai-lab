import MissionStat from './MissionStat';

export default function MissionSection() {
  const stats = [
    { value: '10+', label: 'ACTIVE PROJECTS' },
    { value: '50+', label: 'PUBLICATIONS' },
    { value: '10+', label: 'RESEARCH FELLOWS' },
  ];

  return (
    <section id="rounded-mission" className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">
      {/* Main title at the top */}
      <div className="mb-16 max-w-4xl">
        <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-on-background leading-[1.05] uppercase select-none">
          Pioneering ethical AI for a human-centric future.
        </h2>
      </div>

      {/* Two columns: Mission and Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        <div>
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-4">
            Our Mission
          </h3>
          <p className="font-sans text-base text-on-background/70 leading-[1.75] font-normal">
            HumanAI Research Lab is dedicated to advancing the frontiers of human-centered AI through interdisciplinary research, technological innovation, and collaborative exploration. We aim to develop trustworthy AI systems that enhance human capabilities, solve complex challenges, and create meaningful impact across diverse domains.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-xs font-black tracking-widest text-primary uppercase mb-4">
            Our Vision
          </h3>
          <p className="font-sans text-base text-on-background/70 leading-[1.75] font-normal">
            HumanAI Research Lab envisions a future where AI technologies are designed with humans at the center, enabling inclusive, ethical, and sustainable progress. We strive to become a recognized center of excellence in AI research, education, and innovation, contributing to global advancements while addressing local and societal needs.
          </p>
        </div>
      </div>

      {/* Stats section spanning full width */}
      <div className="grid grid-cols-3 gap-4 pt-12 border-t border-outline">
        {stats.map((stat, i) => (
          <MissionStat key={i} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
