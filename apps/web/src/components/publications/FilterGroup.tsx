import FilterOption from './FilterOption'

export interface FilterChoice {
  value: string
  label: string
  count: number
}

/** A titled set of filter pills; choosing the selected one again clears it. */
export default function FilterGroup({ title, choices, selected, onChange }: {
  title: string
  choices: FilterChoice[]
  selected?: string
  onChange: (value: string | undefined) => void
}) {
  if (!choices.length) {
    return null
  }
  return (
    <fieldset className="border-t border-outline-variant pt-5">
      <legend className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-on-background/60">{title}</legend>
      <ul className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <FilterOption
            key={choice.value}
            label={choice.label}
            count={choice.count}
            selected={selected === choice.value}
            onSelect={() => onChange(selected === choice.value ? undefined : choice.value)}
          />
        ))}
      </ul>
    </fieldset>
  )
}
