import React from 'react'

import { Box } from '@mui/material'

import BusinessIcon from 'assets/common/business2.svg'
import CommercialIcon from 'assets/common/commercial2.svg'
import HouseIcon from 'assets/common/house.svg'
import LandIcon from 'assets/common/land.svg'

export type ImagePlaceholderIconType =
  | 'house'
  | 'land'
  | 'business'
  | 'commercial'

const ImagePlaceholder = ({
  icon = 'house',
  children
}: {
  icon?: ImagePlaceholderIconType
  children?: React.ReactNode
}) => {
  const iconMap = {
    house: HouseIcon,
    land: LandIcon,
    business: BusinessIcon,
    commercial: CommercialIcon
  }

  const Icon = iconMap[icon]

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        bgcolor: '#DDD'
        // OLIVE: '#c7cc69'
        // SKY-TO-GRASS gradient 'linear-gradient(0deg, #cae9c3 25%, #99ddff 100%)',
      }}
    >
      <Box
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: 'absolute',
          filter: 'brightness(4)', // make it white
          backgroundImage: `url(${Icon.src})`,
          backgroundSize: '30% 30%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default ImagePlaceholder
