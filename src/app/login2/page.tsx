import { Suspense } from 'react'

import { PageTemplate } from '@templates'
import { ClientLoginPageContent } from '@pages/login'

const LoginPage = () => {
  return (
    <PageTemplate noHeader noFooter>
      <Suspense>
        <ClientLoginPageContent />
      </Suspense>
    </PageTemplate>
  )
}

export default LoginPage
