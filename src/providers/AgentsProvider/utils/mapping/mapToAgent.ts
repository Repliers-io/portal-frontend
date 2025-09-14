import content from '@configs/content'

import type { ApiAgentsCreateParams, FubUser } from 'services/API'

const mapToAgent = (fubUser: FubUser): ApiAgentsCreateParams => {
  return {
    externalId: String(fubUser.id),
    fname: fubUser.firstName,
    lname: fubUser.lastName,
    phone: fubUser.phone,
    email: fubUser.email,
    brokerage: content.siteDefaultBrokerageName,
    designation: fubUser.role,
    status: true, // use the same approach for mapping as on the backend side
    avatar: fubUser.picture?.['162x162'] // backend requires this size for mapping picture
  }
}

export default mapToAgent
