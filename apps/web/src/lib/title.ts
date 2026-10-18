const SITE = 'Human-AI Lab, University of Moratuwa'

/**
 * The browser tab title: the page first, so it stays readable when tabs are narrow,
 * e.g. "Publications | Human-AI Lab, University of Moratuwa". The home page is just the lab's name.
 */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${SITE}` : 'Human-AI Lab | University of Moratuwa'
}

/** Route `head` for a page with a fixed name. */
export function titled(page?: string) {
  return () => ({ meta: [{ title: pageTitle(page) }] })
}
