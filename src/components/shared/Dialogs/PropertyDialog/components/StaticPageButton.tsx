'use client'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { IconButton } from '@mui/material'

import { useProperty } from 'providers/PropertyProvider'
import { getSeoUrl } from 'utils/properties'

const StaticPageButton = () => {
  const { property } = useProperty()
  const href = getSeoUrl(property)

  return (
    <IconButton
      href={href}
      size="large"
      target="_blank"
      sx={{
        top: 8,
        right: 56,
        position: 'absolute',
        color: 'common.black'
      }}
    >
      <OpenInNewIcon sx={{ width: 20, height: 20, p: '2px' }} />
    </IconButton>
  )
}
export default StaticPageButton
