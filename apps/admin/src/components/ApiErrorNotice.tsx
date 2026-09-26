import { ApiError } from '../api/client.ts'
import Notice from './Notice.tsx'
import ProblemListItem from './ProblemListItem.tsx'

/** Shows what went wrong and, where the API lists them, each field to fix. */
export default function ApiErrorNotice({ error }: { error: Error }) {
  const errors = error instanceof ApiError ? (error.problem.errors ?? []) : []
  const offline = !(error instanceof ApiError)
  return (
    <Notice tone="danger">
      <p className="font-medium">
        {offline ? 'Could not reach the Content API. Is it running on port 8080?' : error.message}
      </p>
      {errors.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {errors.map((e) => <ProblemListItem key={`${e.field}-${e.message}`} error={e} />)}
        </ul>
      )}
    </Notice>
  )
}
