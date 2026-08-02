import StatisticsStat from "./StatisticsStat";

interface Stat {
  value: string
  label: string
}

interface StatisticsSectionProps {
  stats: Stat[]
}

export default function StatisticsSection({
  stats,
}: StatisticsSectionProps) {
  return (
    <section className="relative bg-primary py-24">
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="h-full w-full opacity-5"
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="50" r="150" fill="currentColor" />
          <circle cx="700" cy="350" r="200" fill="currentColor" />
          <circle cx="400" cy="200" r="100" fill="currentColor" />
          <circle cx="50" cy="380" r="80" fill="currentColor" />
          <circle cx="750" cy="40" r="60" fill="currentColor" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="text-4xl font-semibold text-white lg:text-5xl">
          By the Numbers
        </h2>
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <StatisticsStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
