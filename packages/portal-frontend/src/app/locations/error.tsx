'use client'

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function LocationsErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
