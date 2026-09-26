import type { FieldDef, FormValues } from '../collections.ts'
import { CARD_STYLES } from '../collections.ts'
import ImageField from './ImageField.tsx'

const input = 'w-full rounded-xl border border-outline bg-background px-3 py-2 text-sm'

interface Props {
  def: FieldDef
  values: FormValues
  onChange: (key: string, value: string) => void
}

export default function FormField({ def, values, onChange }: Props) {
  const id = `field-${def.key}`
  const value = values[def.key] ?? ''
  const change = (v: string) => onChange(def.key, v)

  if (def.kind === 'image') {
    return <ImageField id={id} label={def.label} value={value} onChange={change} help={def.help} />
  }

  let control
  switch (def.kind) {
    case 'textarea':
    case 'lines':
      control = <textarea id={id} rows={def.rows ?? 3} value={value} required={def.required} placeholder={def.placeholder} onChange={(e) => change(e.target.value)} className={input} />
      break
    case 'select':
      control = (
        <select id={id} value={value} required={def.required} onChange={(e) => change(e.target.value)} className={input}>
          {def.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
      break
    case 'cardStyle':
      control = (
        <select id={id} value={value} onChange={(e) => change(e.target.value)} className={input}>
          {CARD_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      )
      break
    default:
      control = (
        <input
          id={id}
          type={def.kind === 'number' ? 'number' : def.kind === 'url' ? 'url' : 'text'}
          value={value}
          required={def.required}
          placeholder={def.placeholder}
          onChange={(e) => change(e.target.value)}
          className={input}
        />
      )
  }

  return (
    <div className={def.wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {def.label}
        {!def.required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {control}
      {def.help && <p className="mt-1 text-xs text-muted">{def.help}</p>}
    </div>
  )
}
