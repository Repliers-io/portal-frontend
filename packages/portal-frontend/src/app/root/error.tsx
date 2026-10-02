'use client'

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function RootRouteErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
