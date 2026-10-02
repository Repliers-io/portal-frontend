import { redirect } from 'next/navigation'

import routes from '@configs/routes'

/**
 * Bare /search has no content — redirect to the default search view.
 * The route config uses routes.search ('/search') as an alias,
 * so incoming links remain valid while users land on the usable page.
 */
export default function SearchRedirectPage() {
  redirect(routes.map)
}
