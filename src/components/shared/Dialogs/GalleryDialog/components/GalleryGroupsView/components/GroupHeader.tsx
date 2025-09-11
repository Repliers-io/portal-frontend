import { Box, Stack, Typography } from '@mui/material'

import { labelToKey } from 'utils/strings'

const nameMapping: Record<string, string> = {
  'Front of Structure': 'Front View',
  'Back of Structure': 'Back View'
}

const GroupHeader = ({ name }: { name: string }) => {
  const groupId = `group-header-${labelToKey(name)}`
  return (
    <Box
      id={groupId}
      sx={{
        left: 0,
        top: -32,
        zIndex: 100,
        position: 'absolute',
        width: { xs: '100%', sm: 'auto' }
      }}
    >
      <Box
        sx={{
          mt: 4,
          px: 2,
          py: 1,
          bgcolor: '#0003',
          position: 'relative',
          boxSizing: 'border-box',
          borderRadius: { xs: 0, sm: '8px 0 8px 0' },
          textShadow: '1px 1px 2px #0006'
        }}
      >
        <Stack spacing={0.5} direction="row" alignItems="center">
          <Typography variant="h4" color="common.white" noWrap>
            {nameMapping[name] || name}
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export default GroupHeader
