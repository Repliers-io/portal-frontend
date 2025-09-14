import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Typography } from '@mui/material'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

const MapTitle = () => {
  const { title, setTitle, clearEditMode } = useMapOptions()
  const { clearPolygon } = useSearch()

  const handleClear = () => {
    setTitle(null)
    clearPolygon()
    clearEditMode()
  }

  const visible = !!title
  const formattedTitle = (title || '').length === 50 ? title + '...' : title

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        overflow: 'hidden',
        position: 'absolute',
        display: { xs: 'none', sm: 'block' },
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.5,
          boxShadow: 1,
          bgcolor: '#FFFA',
          backdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transform: visible ? '' : 'translateY(-100%)',
          transition: 'opacity 0.15s ease, transform 0.15s ease'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography variant="h6" sx={{ p: 1 }}>
            {formattedTitle}
          </Typography>
          <IconButton sx={{ color: 'common.black' }} onClick={handleClear}>
            <CloseIcon sx={{ width: '24px', height: '24px' }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  )
}

export default MapTitle
