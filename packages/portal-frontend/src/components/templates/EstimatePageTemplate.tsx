import React from 'react'

import { ClientSidePageTemplate } from '.'

export const EstimatePageTemplate = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <ClientSidePageTemplate bgcolor="background.default">
      {children}
    </ClientSidePageTemplate>
  )
}
