'use client'

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function EstimatesErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
