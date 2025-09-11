import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Box, Stack, Typography } from '@mui/material'

import content from '@configs/content'

export type RestrictedMessageVariant = 'card' | 'gallery' | 'map'

const RestrictedMessage = ({
  variant = 'card'
}: {
  variant: RestrictedMessageVariant
}) => {
  const iconFontSize = variant === 'gallery' ? 'large' : 'medium'
  const messageVariant = variant === 'gallery' ? 'body2' : 'caption'

  return (
    <Box
      sx={{
        top: '50%',
        left: '0%',
        width: '100%',
        position: 'absolute',
        transform: 'translate(0%, -50%)'
      }}
    >
      <Stack spacing={1} alignItems="center">
        <VisibilityOffOutlinedIcon
          fontSize={iconFontSize}
          sx={{ color: 'common.white' }}
        />
        {variant !== 'map' && (
          <Typography
            variant={messageVariant}
            sx={{
              px: 5,
              maxWidth: 400,
              textAlign: 'center',
              color: 'common.white'
            }}
          >
            {content.restrictedPropertyTitle}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export default RestrictedMessage
