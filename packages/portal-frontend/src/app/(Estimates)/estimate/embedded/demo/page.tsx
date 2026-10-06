import { PageTemplate } from '@templates'
import { EstimateDemoPageContent } from '@pages/estimate'

export const dynamic = 'force-dynamic'

const EstimateDemoPage = () => {
  return (
    <PageTemplate bgcolor="background.default">
      <EstimateDemoPageContent />
    </PageTemplate>
  )
}

export default EstimateDemoPage
