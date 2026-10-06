'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import queryString from 'query-string'

import { Box, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'
import { WidgetHtmlText } from '@shared/CmsWidgets/components'

import { AddressSection } from './sections'

interface Step0WidgetProps {
  showMap?: boolean
  /**
   * Window target for opening estimate form
   * @default '_blank'
   */
  target?: '_blank' | '_self' | '_top'
  title?: string
  subtitle?: string
  submit?: string
}

const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

/**
 * Step0Widget - simplified estimate form step for widget usage
 * Opens estimate in new window when submitted
 */
const Step0Widget = ({
  showMap = false,
  target = '_blank',
  title = 'Wondering what your home is worth?',
  subtitle = "Find out instantly how much your home is worth in today's market.",
  submit
}: Step0WidgetProps) => {
  const router = useRouter()

  const handleSubmit = () => {
    const params = queryString.stringify({ step: 1, external: true })
    const url = `${routes.estimate}?${params}`

    try {
      if (target === '_self') {
        // Use Next.js router for same-page navigation
        router.push(url)
      } else {
        // Use window.open for new window/tab or parent window
        const fullUrl = `${appDomain}${url}`
        window.open(fullUrl, target)
      }
    } catch (error) {
      console.error('Error opening estimate form:', error)
    }
  }

  return (
    <Stack spacing={2} sx={{ flex: 1 }} justifyContent="center">
      <Stack>
        <Typography variant="h3">
          <WidgetHtmlText>{title}</WidgetHtmlText>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <WidgetHtmlText>{subtitle}</WidgetHtmlText>
        </Typography>
      </Stack>
      <Box
        sx={{
          width: '100%',
          '& > .MuiStack-root > .MuiStack-root:first-of-type': {
            width: '100% !important',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }
          },
          '& > .MuiStack-root > .MuiStack-root:first-of-type > .MuiButton-root':
            {
              gridColumn: '1 / -1'
            }
        }}
      >
        <AddressSection
          showMap={showMap}
          onSubmit={handleSubmit}
          submit={submit}
        />
      </Box>
    </Stack>
  )
}

export default Step0Widget
