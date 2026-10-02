import { ClientSidePageTemplate } from '@templates'
import { UnsubscribePageContent } from '@pages/profile'

const UnsubscribePage = () => {
  return (
    <ClientSidePageTemplate loginRedirect>
      <UnsubscribePageContent />
    </ClientSidePageTemplate>
  )
}

export default UnsubscribePage
