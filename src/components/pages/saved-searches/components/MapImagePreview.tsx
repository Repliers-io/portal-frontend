import Image from 'next/image'
import type { Position } from 'geojson'

import { Box } from '@mui/material'

import { info } from '@configs/colors'
import mapConfig from '@configs/map'

import useBreakpoints from 'hooks/useBreakpoints'
import {
  calcZoomLevelForBounds,
  getMapboxStaticStyleUrl,
  getPositionBounds
} from 'utils/map'

import { getPositionJson } from '../utils'

const logoOffset = 30
const PolygonPreviewMapImage = ({
  position,
  width,
  height,
  zoomOffset = 0.5
}: {
  position: Position[]
  width: number
  height: number
  zoomOffset?: number
}) => {
  const { mobile } = useBreakpoints()

  const encodedJson = getPositionJson(position, info)
  const bounds = getPositionBounds(position)
  const zoom = Math.floor(
    // lets drop all the images to the same integer levels of zoom to be able
    // to compare them against each other in the list
    calcZoomLevelForBounds(bounds, width, height) - zoomOffset
  )
  const { lng, lat } = bounds.getCenter()

  const imageSize = `${width}x${height + logoOffset}@2x`
  const staticStyleUrl = getMapboxStaticStyleUrl('map')
  const staticImageUrl = `${staticStyleUrl}/${encodedJson}/${lng},${lat},${zoom}/${imageSize}?access_token=${mapConfig.mapboxDefaults.accessToken}`

  return (
    <Box
      title={`Zoom level: ${zoom}`}
      sx={{
        width: { xs: width - 40, sm: width },
        height,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <Image
        unoptimized
        width={width}
        height={height + logoOffset}
        alt="Map preview"
        src={staticImageUrl}
        style={{
          marginLeft: mobile ? -20 : 0,
          marginTop: `${logoOffset * -0.5}px`,
          position: 'relative'
        }}
      />
    </Box>
  )
}

export default PolygonPreviewMapImage
