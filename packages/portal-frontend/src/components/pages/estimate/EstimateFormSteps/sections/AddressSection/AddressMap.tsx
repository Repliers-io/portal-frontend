import { Box } from '@mui/material'

import { type EstimateListingType } from '@configs/estimate'
import estimateConfig from '@configs/estimate'

import { type ApiCoordsWithZip } from 'services/API'
import { getGmapsStaticImageUrl, getMapboxStaticImageUrl } from 'utils/map'

export const AddressMap = ({
  point,
  width,
  height,
  listingType,
  loading = false
}: {
  point: ApiCoordsWithZip
  width: number
  height: number
  listingType: EstimateListingType
  loading?: boolean
}) => {
  const symbol = listingType === 'condo' ? 'building' : 'home'
  const getStaticImageUrl =
    estimateConfig.addressMapProvider === 'google'
      ? getGmapsStaticImageUrl
      : getMapboxStaticImageUrl
  const staticImageUrl = getStaticImageUrl({ point, symbol, width, height })

  return (
    <Box
      sx={{
        zIndex: 2,
        height, // Set height to be smaller of 40% viewport height or 200px
        width: '100%',
        borderRadius: 1,
        position: 'relative',
        opacity: loading ? 0.5 : 1,
        contentVisibility: 'visible',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        transition: 'opacity 0.3s'
      }}
      style={{
        // MUI has issues with `sx` compilation for this backgroundImage
        backgroundImage: `url("${staticImageUrl}")`
      }}
    />
  )
}
