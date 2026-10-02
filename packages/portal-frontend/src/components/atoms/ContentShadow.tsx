import { Box } from '@mui/material'

// Where the band starts inside a dialog. The header above the scroll area has to end
// exactly here, or the content begins above the shadow and the two read as detached.
export const contentShadowTop = 64

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
        top: contentShadowTop,
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
