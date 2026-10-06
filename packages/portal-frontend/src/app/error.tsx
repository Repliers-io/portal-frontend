'use client'

// Error components MUST be Client Components

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
