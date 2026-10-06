import { Box } from '@mui/material'

import { type ApiListing } from 'services/API'

import { CardContent } from '../../ListingCard/components'

export const DrawerContent = ({ listing }: { listing: ApiListing }) => (
  <Box
    sx={{
      flex: 1,
      overflow: 'hidden',
      '& > .MuiStack-root:first-of-type': {
        flex: 1,
        p: 2,
        height: '100%',
        boxSizing: 'border-box'
      },
      '& .MuiTypography-noWrap': {
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'clip'
      }
    }}
  >
    <CardContent listing={listing} size="small" />
  </Box>
)
