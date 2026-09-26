import type { components } from '@hai/content-schema'

export default function ProblemListItem({ error }: { error: components['schemas']['FieldError'] }) {
  return <li>{error.message}</li>
}
