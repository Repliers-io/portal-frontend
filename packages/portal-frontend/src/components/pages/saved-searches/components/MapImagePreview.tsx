import Image from 'next/image'
import type { Position } from 'geojson'

import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'

import { info } from '@configs/colors'
import mapConfig from '@configs/map'

import useBreakpoints from 'hooks/useBreakpoints'
import {
  calcZoomLevelForBounds,
  getMapboxStaticStyleUrl,
  getPositionBounds
} from 'utils/map'

import { getMapJson } from '../utils'

const logoOffset = 30
const PolygonPreviewMapImage = ({
  map,
  width,
  height,
  zoomOffset = 0.5,
  sx = {}
}: {
  /** Saved-search `map` rings — all rendered, framed together. */
  map: Position[][]
  width: number
  height: number
  zoomOffset?: number
  sx?: SxProps<Theme>
}) => {
  const { mobile } = useBreakpoints()

  const encodedJson = getMapJson(map, info)
  const bounds = getPositionBounds(map.flat())
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
      sx={[
        {
          width: { xs: width - 40, sm: width },
          height,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.default'
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Image
        unoptimized
        width={width}
        height={height + logoOffset}
        alt="Map preview"
        src={staticImageUrl}
        style={{
          position: 'relative',
          marginLeft: mobile ? -20 : 0,
          marginTop: `${logoOffset * -0.5}px`
        }}
      />
    </Box>
  )
}

export default PolygonPreviewMapImage
