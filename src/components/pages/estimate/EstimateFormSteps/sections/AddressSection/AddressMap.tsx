import { Box } from '@mui/material'

import { type EstimateListingType } from '@configs/estimate'

import { type ApiCoordsWithZip } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import { getGmapsStaticImageUrl, getMapboxStaticImageUrl } from 'utils/map'

import { getPropertyMock } from './utils'

const AddressMap = ({
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
  const features = useFeatures()
  const property = getPropertyMock(listingType)
  const getStaticImageUrl =
    features.searchProvider === 'google'
      ? getGmapsStaticImageUrl
      : getMapboxStaticImageUrl
  const staticImageUrl = getStaticImageUrl({ point, property, width, height })

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

export default AddressMap
