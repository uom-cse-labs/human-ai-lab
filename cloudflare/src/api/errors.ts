/** Failures as RFC 9457 problem details with the stable codes defined in contracts/openapi.yaml. */

export interface FieldError {
  field: string
  message: string
}

const REASONS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  413: 'Content Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Content',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    detail: string,
    readonly errors?: FieldError[],
  ) {
    super(detail)
  }

  toResponse(): Response {
    return problemResponse(this.status, this.code, this.message, this.errors)
  }
}

export function problemResponse(status: number, code: string, detail: string, errors?: FieldError[]): Response {
  const body = {
    type: `https://humanai.cse.mrt.ac.lk/problems/${code.toLowerCase().replaceAll('_', '-')}`,
    title: REASONS[status] ?? 'Error',
    status,
    code,
    detail,
    ...(errors ? { errors } : {}),
  }
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/problem+json' } })
}

export const notFound = (what: string) => new ApiError(404, 'NOT_FOUND', `${what} not found`)

export const forbidden = () => new ApiError(403, 'FORBIDDEN',
  "Your role can't do this. Publishing, rolling back, hiding and deleting content need the admin role.")
