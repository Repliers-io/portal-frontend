import { ClientSidePageTemplate } from '@templates'
import { AgentClientsContent } from '@pages/agent'

const AgentClientsPage = () => {
  return (
    <ClientSidePageTemplate
      loginRedirect
      roles={['agent', 'admin']}
      bgcolor="background.default"
    >
      <AgentClientsContent />
    </ClientSidePageTemplate>
  )
}

export default AgentClientsPage
