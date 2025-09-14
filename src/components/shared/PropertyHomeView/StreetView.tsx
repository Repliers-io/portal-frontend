import React, { useState } from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'

import { Box, type BoxProps } from '@mui/material'

import { type EstimateData, type EstimatePayload } from '@configs/estimate'

import { ImagePlaceholder } from 'components/atoms'

import useStreetView from 'hooks/useStreetView'

const StreetViewImage: React.FC<{
  src: string
  setLoading: (loading: boolean) => void
}> = ({ src, setLoading }) => (
  <Box width="100%" height="100%" position="absolute">
    <Image
      src={src}
      layout="fill"
      objectFit="cover"
      objectPosition="center"
      alt="Street View"
      onLoadingComplete={() => setLoading(false)}
    />
  </Box>
)

type StreetViewProps = {
  estimateData: EstimateData | null
  noLink?: boolean
  size?: string
} & BoxProps

const StreetView: React.FC<StreetViewProps> = ({
  estimateData,
  noLink = false,
  size = '576x448',
  ...props
}) => {
  const [loading, setLoading] = useState(true)

  const { payload, request } = estimateData as EstimateData
  const { address, map } = (payload || request) as EstimatePayload

  const { thumbnailImage: src, url } = useStreetView({
    address,
    map,
    options: { size }
  })

  return (
    <Box
      minHeight={{
        xs: 350,
        md: '100%'
      }}
      overflow="hidden"
      position="relative"
      {...props}
    >
      {loading && <ImagePlaceholder />}

      {src &&
        (noLink ? (
          <StreetViewImage src={src} setLoading={setLoading} />
        ) : (
          <Link href={url} target="_blank">
            <StreetViewImage src={src} setLoading={setLoading} />
          </Link>
        ))}
    </Box>
  )
}

export default StreetView
