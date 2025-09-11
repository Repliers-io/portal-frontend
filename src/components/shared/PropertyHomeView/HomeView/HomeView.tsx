import React from 'react'

import { Box, type BoxProps, type SxProps, type Theme } from '@mui/material'

import { type EstimateData, showEstimateImage } from '@configs/estimate'

import { ImagePlaceholder } from 'components/atoms'

import DefaultImage from './DefaultImage'
import DefaultStreetView from './DefaultStreetView'

/*
  ======= Several examples how it can be used =======

  // Basic variant
  <HomeView estimateData={estimateData} />

  // Custom image rendering
  <HomeView
    estimateData={estimateData}
    renderImage={({ imageUrl }) => (
      <CustomImage url={imageUrl} />
    )}
  />

  // Custom street view rendering
  <HomeView
    estimateData={estimateData}
    renderStreetView={({ estimateData }) => (
      <CustomStreetView data={estimateData} />
    )}
  />

  // Custom everything
  <HomeView
    estimateData={estimateData}
    renderImage={customImageRenderer}
    renderStreetView={customStreetViewRenderer}
    position="relative"
    sx={{ width: '100%' }}
  />
*/

interface RenderImageProps extends BoxProps {
  imageUrl: string
}

interface RenderStreetViewProps {
  estimateData: EstimateData
}

interface HousePictureRenderProps {
  renderImage?: (props: RenderImageProps) => React.ReactNode
  renderStreetView?: (props: RenderStreetViewProps) => React.ReactNode
}

interface HousePictureProps extends HousePictureRenderProps, BoxProps {
  estimateData: EstimateData | null
  imageContainerSx?: SxProps<Theme>
}

const defaultStyles = {
  width: {
    xs: '100%',
    md: '50%'
  },
  flexGrow: {
    xs: 1,
    md: 0
  },
  minHeight: {
    xs: 350,
    md: '100%'
  }
} as const

const HomeView: React.FC<HousePictureProps> = ({
  estimateData,
  renderImage = DefaultImage,
  renderStreetView = DefaultStreetView,
  sx,
  imageContainerSx,
  ...props
}) => {
  if (!estimateData?.request && !estimateData?.payload) {
    return <ImagePlaceholder />
  }

  const imageUrl =
    estimateData.request?.data?.imageUrl || estimateData.payload?.data?.imageUrl

  return (
    <Box
      position="relative"
      sx={{
        ...defaultStyles,
        ...sx
      }}
      {...props}
    >
      {imageUrl && showEstimateImage
        ? renderImage({ imageUrl, sx: imageContainerSx })
        : renderStreetView({ estimateData })}
    </Box>
  )
}

export type {
  HousePictureProps,
  HousePictureRenderProps,
  RenderImageProps,
  RenderStreetViewProps
}
export default HomeView
