import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client.ts'

/** Loads data on mount; `reload()` fetches again. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<ApiError | Error | undefined>()
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await load())
      setError(undefined)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload, setData }
}
