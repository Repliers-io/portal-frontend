'use client'

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function ClientPagesErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
