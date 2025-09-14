import { alpha, Box, lighten } from '@mui/material'

import { info } from '@configs/colors'

import { useMapOptions } from 'providers/MapOptionsProvider'

const SaveSearchCanvas = () => {
  const { editMode } = useMapOptions()

  const visible = editMode === 'highlight'

  const padding = 6

  if (!visible) return null

  return (
    <Box
      sx={{
        top: padding,
        left: padding,
        right: padding,
        bottom: padding,
        position: 'absolute',
        borderRadius: 2,
        border: `1.5px dashed ${lighten(info, 0.2)}`,
        bgcolor: alpha(info, 0.2),
        color: 'common.white'
      }}
    />
  )
}

export default SaveSearchCanvas
