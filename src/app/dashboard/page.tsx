import { features } from 'features'

import { ClientSidePageTemplate, Page404Template } from '@templates'
import DashboardPageContent from '@pages/dashboard'

import SearchProvider from 'providers/SearchProvider'

const DashboardPage = () => {
  if (!features.dashboard) return <Page404Template />

  return (
    <ClientSidePageTemplate>
      <SearchProvider>
        <DashboardPageContent />
      </SearchProvider>
    </ClientSidePageTemplate>
  )
}

export default DashboardPage
