import { ClientSidePageTemplate } from '@templates'
import { AgentEstimatesContent } from '@pages/agent'

import { type RouteProps } from 'app/types'

type Params = {
  clientId: number
}

type SearchParams = {
  s?: string
}

const AgentEstimatesPage = async (props: RouteProps<Params, SearchParams>) => {
  const params = await props.params
  const searchParams = await props.searchParams

  return (
    <ClientSidePageTemplate
      loginRedirect
      roles={['agent', 'admin']}
      bgcolor="background.default"
    >
      <AgentEstimatesContent
        clientId={params.clientId}
        signature={searchParams.s}
      />
    </ClientSidePageTemplate>
  )
}

export default AgentEstimatesPage
