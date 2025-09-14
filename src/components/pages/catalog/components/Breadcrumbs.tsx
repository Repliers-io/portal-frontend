import Link from 'next/link'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import { getCatalogUrl } from 'utils/urls'

const Breadcrumbs = ({
  area,
  city,
  hood
}: {
  area?: string
  city?: string
  hood?: string
}) => {
  const crumbs = [defaultLocation.state, area, city, hood].filter(
    (crumb) => crumb
  )

  if (crumbs.length === 1) return null

  const crumbsLinks = crumbs.map((crumb, index) => {
    const url = getCatalogUrl(...crumbs.slice(1, index + 1))
    return (
      <Link key={crumb} href={url}>
        <Typography fontSize={14} fontWeight={500}>
          {crumb}
        </Typography>
      </Link>
    )
  })

  return (
    <Stack
      spacing={0.75}
      direction="row"
      alignItems="center"
      divider={<ChevronRightIcon sx={{ fontSize: 18 }} />}
    >
      {crumbsLinks}
    </Stack>
  )
}

export default Breadcrumbs
