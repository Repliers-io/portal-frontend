import type React from 'react'

import { ClientSidePageTemplate } from '@templates'

const FormPageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClientSidePageTemplate bgcolor="background.default">
      {children}
    </ClientSidePageTemplate>
  )
}

export default FormPageContainer
