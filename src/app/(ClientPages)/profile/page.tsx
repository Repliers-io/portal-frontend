'use client'
import { features } from 'features'

import { ClientSidePageTemplate, Page404Template } from '@templates'
import ProfilePageContent from '@pages/profile'

const ProfilePage = () => {
  if (!features.profile) return <Page404Template />

  return (
    <ClientSidePageTemplate loginRequired>
      <ProfilePageContent />
    </ClientSidePageTemplate>
  )
}
export default ProfilePage
