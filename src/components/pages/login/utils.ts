import queryString from 'query-string'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'

const { authCallbackKey } = storageConfig

export const storeRedirectUrl = (forceLoginRedirect = false) => {
  if (typeof window === 'undefined') return

  // Parse the query parameters from the URL
  const params = queryString.parse(window.location.search) || {}

  const path = window.location.pathname // shorthand
  const redirectParam = params.redirect as string
  const currentPage = path + window.location.search

  let redirectUrl = redirectParam || currentPage

  // use default redirect page if the user came to the login page directly (no referer)
  if (forceLoginRedirect || (!redirectParam && path.includes(routes.login)))
    redirectUrl = routes.loginRedirect

  localStorage.setItem(authCallbackKey, redirectUrl)
}
