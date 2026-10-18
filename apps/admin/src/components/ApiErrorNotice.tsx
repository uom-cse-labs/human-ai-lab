import { ApiError, SessionExpiredError, SIMULATED_SIGN_IN } from '../api/client.ts'
import Notice from './Notice.tsx'
import ProblemListItem from './ProblemListItem.tsx'

/** Shows what went wrong and, where the API lists them, each field to fix. */
export default function ApiErrorNotice({ error }: { error: Error }) {
  const errors = error instanceof ApiError ? (error.problem.errors ?? []) : []
  if (error instanceof SessionExpiredError) {
    return (
      <Notice tone="danger">
        <p className="font-medium">Your sign-in has expired, so this couldn't be saved or loaded.</p>
        <p className="mt-1">Reload the page to sign in again. Unsaved changes on this page will be lost, so copy any long text first.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Reload and sign in
        </button>
      </Notice>
    )
  }
  return (
    <Notice tone="danger">
      <p className="font-medium">
        {error instanceof ApiError
          ? error.message
          : SIMULATED_SIGN_IN
            ? 'Could not reach the Content API. Is it running on port 8080? (npm run dev:local)'
            : 'Could not reach the server. Check your internet connection and try again.'}
      </p>
      {errors.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {errors.map((e) => <ProblemListItem key={`${e.field}-${e.message}`} error={e} />)}
        </ul>
      )}
    </Notice>
  )
}
