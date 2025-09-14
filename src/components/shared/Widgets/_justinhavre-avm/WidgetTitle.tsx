import Image from 'next/image'
import type React from 'react'

import { Box, Stack, Typography } from '@mui/material'

const WidgetTitle = ({
  title,
  icon
}: {
  title?: string | React.ReactNode
  icon?: string
}) => {
  return (
    <Box px={3} pt={3} bgcolor="background.paper">
      <Stack
        spacing={3}
        direction="row"
        alignItems="center"
        minHeight={{ xs: 'auto', sm: 48 }}
      >
        {icon && <Image src={icon} alt="" width={32} height={32} />}
        <Typography
          variant="h3"
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title || ''}
        </Typography>
      </Stack>
    </Box>
  )
}

export default WidgetTitle
