import { notFound } from 'next/navigation'

import features from '@configs/features'
import { ClientSidePageTemplate } from '@templates'
import ProfilePageContent from '@pages/profile'

const ProfilePage = async () => {
  if (!features.profile) notFound()

  return (
    <ClientSidePageTemplate loginRequired>
      <ProfilePageContent />
    </ClientSidePageTemplate>
  )
}
export default ProfilePage
