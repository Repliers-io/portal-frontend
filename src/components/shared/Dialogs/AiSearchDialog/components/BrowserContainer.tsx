import { type ReactNode, useEffect, useRef } from 'react'

import { Box, Stack } from '@mui/material'

import { browserHeight } from '../constants'

import { InspirationsNavbar } from '.'

const BrowserContainer = ({
  title = '',
  onBack,
  children
}: {
  title?: string
  onBack?: () => void
  children: ReactNode
}) => {
  const mode = title ? 'items' : 'folders'
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [title])

  return (
    <Box
      sx={{
        p: 0,
        pl: { sm: 2 },
        pr: { sm: 0 },
        py: { sm: 2 },
        width: '100%',
        border: { xs: 0, sm: 1 },
        borderColor: { sm: 'divider' },
        borderRadius: 2,
        boxSizing: 'border-box',
        overflow: { xs: 'visible', sm: 'hidden' }
      }}
    >
      <Stack spacing={2}>
        {title && <InspirationsNavbar title={title} onBack={onBack} />}

        <Box
          ref={containerRef}
          sx={{
            pl: { xs: 2, sm: 0 },
            pr: { xs: 2, sm: 2 },
            pb: { xs: 2, sm: 0 },
            mx: { xs: -2, sm: 0 },
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            height: {
              xs: `calc(100svh - ${mode === 'items' ? 192 : 144}px)`,
              sm: mode === 'items' ? browserHeight - 48 : browserHeight
            }
          }}
        >
          <Stack
            spacing={2}
            direction="row"
            flexWrap="wrap"
            justifyContent={{ sm: 'center', md: 'flex-start' }}
            mr={{ md: -4 }}
          >
            {children}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default BrowserContainer
