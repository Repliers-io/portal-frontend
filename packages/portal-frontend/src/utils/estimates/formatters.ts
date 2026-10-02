import type { ApiFubAddress } from 'services/API'

import { capitalize, joinNonEmpty } from '../strings'

export const formatAddress = (
  address: ApiFubAddress,
  availableFullAddress = false
) => {
  const { city, street, state, code } = address

  return joinNonEmpty(
    [
      capitalize(street),
      capitalize(city),
      ...(availableFullAddress ? [capitalize(state), capitalize(code)] : [])
    ],
    ', '
  )
}
