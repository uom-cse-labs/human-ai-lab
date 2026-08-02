interface StatisticsStatProps {
  value: string
  label: string
}

export default function StatisticsStat({ value, label }: StatisticsStatProps) {
  return (
    <div className="text-center">
      <span className="text-4xl font-bold text-white lg:text-5xl">
        {value}
      </span>
      <p className="mt-2 text-sm text-white/80">{label}</p>
    </div>
  )
}
