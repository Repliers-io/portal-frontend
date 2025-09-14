import { Box } from '@mui/material'

const ContentShadow = ({
  sx = {},
  visible = false
}: {
  sx?: any
  visible: boolean
}) => {
  return (
    <Box
      sx={{
        top: 64,
        height: 36,
        width: '100%',
        zIndex: 'drawer',
        position: 'absolute',
        pointerEvents: 'none',
        transition: 'opacity 0.2s',
        opacity: visible ? 1 : 0,
        background: 'linear-gradient(0deg, #FFF0 0%, #A1A1A126 100%)',
        ...sx
      }}
    />
  )
}

export default ContentShadow
