import { ClientSidePageTemplate } from '@templates'
import { RevalidateForm } from '@pages/admin/RevalidateForm'

export const dynamic = 'force-dynamic'

const RevalidatePage = () => (
  <ClientSidePageTemplate loginRequired bgcolor="background.paper">
    <RevalidateForm />
  </ClientSidePageTemplate>
)

export default RevalidatePage
