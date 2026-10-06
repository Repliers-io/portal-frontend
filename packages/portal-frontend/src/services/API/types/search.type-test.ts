import { type ListingStatus } from '@configs/filters'

import { type StandardStatus } from 'services/API'

// pending must be a valid internal status (URBN adds it)
const pending: ListingStatus = 'pending'
// StandardStatus must include the RESO values URBN filters by
const active: StandardStatus = 'Active'
const auc: StandardStatus = 'Active Under Contract'
const closed: StandardStatus = 'Closed'

export const _typeProbe = { pending, active, auc, closed }
