'use client'

import { type ErrorPageProps, ErrorPageTemplate } from '@templates'

export default function DashboardErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorPageTemplate error={error} reset={reset} />
}
