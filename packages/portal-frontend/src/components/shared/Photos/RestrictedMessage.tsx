import { useTranslations } from 'next-intl'

import { Box, Stack, Typography } from '@mui/material'

import { VisibilityOffOutlinedIcon } from '@configs/icons'

export type RestrictedMessageVariant = 'card' | 'gallery' | 'map' | 'drawer'

export const RestrictedMessage = ({
  variant = 'card'
}: {
  variant: RestrictedMessageVariant
}) => {
  const t = useTranslations()
  const gallery = variant === 'gallery'
  // The drawer supplies its own icon over the blurred gallery half and positions
  // the message with its own scrim, so it renders in flow without the icon.
  const drawer = variant === 'drawer'
  const iconFontSize = gallery ? 'large' : 'medium'
  const messageVariant = gallery ? 'body2' : 'caption'

  const content = (
    <Stack spacing={1.5} justifyContent="center" alignItems="center">
      {!drawer && (
        <VisibilityOffOutlinedIcon
          fontSize={iconFontSize}
          sx={{ color: 'common.white' }}
        />
      )}
      {/* The small/map card shows the icon only. Showing the restriction text on
          small cards too is pending manager approval — to enable, drop the
          `variant !== 'map'` guard below. See also the movesmartly fork. */}
      {variant !== 'map' && (
        <Typography
          variant={messageVariant}
          sx={{
            maxWidth: '80%',
            textAlign: 'center',
            color: 'common.white'
          }}
        >
          {t('Property.restricted')}
        </Typography>
      )}
    </Stack>
  )

  if (drawer) return content

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
      {content}
    </Box>
  )
}
