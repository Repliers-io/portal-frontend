import React from 'react'

import { Button, Paper, Stack, type StackOwnProps } from '@mui/material'

import propsConfig from '@configs/properties'

interface Props extends StackOwnProps {
  children: React.ReactNode
  href?: string
  showButton?: boolean
  buttonTitle?: string
  onClick?: () => void
  blurred?: boolean
}

const BlurredContainer: React.FC<Props> = ({
  children,
  blurred = false,
  showButton = true,
  buttonTitle = 'FILL IN HOME EQUITY DATA',
  onClick,
  href,
  ...rest
}) => {
  const blurredStyles = {
    pointerEvents: 'none',
    filter: `blur(${propsConfig.blurredImageRadius}px)`
  }

  const overlayStyles = {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <Paper>
      <Stack position="relative" {...rest}>
        {blurred && (
          <Stack sx={overlayStyles}>
            {showButton && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ px: 3 }}
                href={href}
                onClick={onClick}
              >
                {buttonTitle}
              </Button>
            )}
          </Stack>
        )}
        <Stack sx={blurred ? blurredStyles : undefined}>{children}</Stack>
      </Stack>
    </Paper>
  )
}

export default BlurredContainer
