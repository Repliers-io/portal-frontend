import { DialogTitle } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import { type Property } from 'services/API'
import { formatShortAddress, getSeoTitle } from 'utils/properties'

const PropertyTitle = ({ property }: { property: Property }) => {
  return (
    <DialogTitle sx={{ userSelect: 'none' }}>
      <div title={getSeoTitle(property)}>
        <ScrubbedText>{formatShortAddress(property.address)}</ScrubbedText>
      </div>
    </DialogTitle>
  )
}

export default PropertyTitle
