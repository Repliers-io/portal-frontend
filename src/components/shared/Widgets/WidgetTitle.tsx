import Image from 'next/image'
import type React from 'react'

import { Box, CircularProgress, Stack, Typography } from '@mui/material'

const WidgetTitle = ({
  title,
  icon,
  loading = false
}: {
  title?: string | React.ReactNode
  icon?: string
  loading?: boolean
}) => {
  return (
    <Box p={3} bgcolor="background.default">
      <Stack
        spacing={3}
        direction="row"
        alignItems="center"
        minHeight={{ xs: 'auto', sm: 48 }}
      >
        {loading ? (
          <CircularProgress size={32} sx={{ opacity: 0.3 }} />
        ) : (
          <>
            {icon && <Image src={icon} alt="" width={32} height={32} />}
            <Typography
              variant="h4"
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title || ''}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  )
}

export default WidgetTitle
// import { Box, Stack, Typography } from '@mui/material'
