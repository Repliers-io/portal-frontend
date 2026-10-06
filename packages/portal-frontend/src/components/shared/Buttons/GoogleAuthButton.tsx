import React from 'react'

import { Box, Button, Stack, type SxProps } from '@mui/material'

import { GoogleIcon } from '@configs/icons'
import { storeRedirectUrl } from '@pages/login/utils'

import { APIAuth } from 'services/API'
import useAnalytics from 'hooks/useAnalytics'
import useClientSide from 'hooks/useClientSide'

const logoBackground = '#FFF'
const darkBackground = '#202125'
const primaryBackground = '#3872e0'

export const GoogleAuthButton = ({
  text = 'Continue with Google',
  variant = 'primary',
  fullWidth = false,
  sx
}: {
  text?: string
  variant?: 'primary' | 'dark' | 'white'
  fullWidth?: boolean
  sx?: SxProps
}) => {
  const trackEvent = useAnalytics()
  const clientSide = useClientSide()

  let color, bgcolor, borderColor, activeBackground, activeBorderColor

  if (variant === 'primary') {
    color = 'common.white'
    bgcolor = primaryBackground
    borderColor = primaryBackground
    // active styles
    activeBackground = darkBackground
    activeBorderColor = darkBackground
  } else if (variant === 'dark') {
    color = 'common.white'
    bgcolor = darkBackground
    borderColor = darkBackground
    // active styles
    activeBackground = primaryBackground
    activeBorderColor = primaryBackground
  } else {
    // variant === 'white'
    color = 'common.black'
    bgcolor = logoBackground
    borderColor = darkBackground
    // active styles
    activeBackground = logoBackground
    activeBorderColor = primaryBackground
  }

  const handleGoogleAuth = async () => {
    trackEvent('auth', { flow: 'google' })
    storeRedirectUrl()

    const response = await APIAuth.auth('google')
    window.location.href = response.url
  }

  return (
    <Button
      size="large"
      variant="outlined"
      disabled={!clientSide}
      onClick={handleGoogleAuth}
      sx={{
        p: 0,
        width: fullWidth ? '100%' : 290,
        height: 52,
        color,
        bgcolor,
        borderColor: `${borderColor} !important`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',

        '&:hover': {
          bgcolor: `${activeBackground} !important`,
          borderColor: `${activeBorderColor} !important`
        },

        '& .MuiButton-startIcon': {
          mr: 2
        },

        '&.Mui-disabled svg': {
          opacity: 0.5,
          filter: 'grayscale(100%)'
        },

        ...sx
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          height: '100%',
          width: variant === 'white' ? 'auto' : '100%',
          gap: variant === 'white' ? 2 : 0
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: variant === 'white' ? '' : '1 / 1',

            bgcolor: logoBackground
          }}
        >
          <GoogleIcon />
        </Box>
        <Box sx={{ flex: variant === 'white' ? 0 : 1, textAlign: 'center' }}>
          {text}
        </Box>
      </Stack>
    </Button>
  )
}
