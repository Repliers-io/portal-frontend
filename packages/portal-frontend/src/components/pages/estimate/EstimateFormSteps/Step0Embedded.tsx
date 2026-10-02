'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

import { Box, GlobalStyles, Stack, Typography } from '@mui/material'
import { debounce } from '@mui/material/utils'

import contentConfig from '@configs/content'

import useResponsiveValue from 'hooks/useResponsiveValue'

import { AddressSection } from './sections'

const resizeDebouneDelay = 100
const { siteName, siteFooterLogo } = contentConfig

const Step0Embedded = ({
  onSubmit
}: {
  onSubmit?: (address: any, unitNumber: string) => void
}) => {
  const params = useSearchParams()
  const showLogo = Boolean(params.get('logo'))

  const iframeWindow =
    typeof window !== 'undefined' && window.self !== window.top // child window

  const heightThreshold = useResponsiveValue({ xs: 542, sm: 450 }) || 542
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const handleResize = debounce(() => {
      setShowMap(window.innerHeight >= heightThreshold)
    }, resizeDebouneDelay)

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      handleResize.clear() // Clear the debounce timer on unmount
      window.removeEventListener('resize', handleResize)
    }
  }, [heightThreshold])

  const handleMapAvailability = (available: boolean) => {
    if (iframeWindow || !available) return

    if (window.innerHeight < heightThreshold) {
      const currentInnerWidth = window.innerWidth

      const heightDifference = window.outerHeight - window.innerHeight
      const targetOuterHeight = heightThreshold + heightDifference

      const widthDifference = window.outerWidth - window.innerWidth
      const targetOuterWidth = currentInnerWidth + widthDifference
      // NOTE: Browsers might block this action for security reasons if the window
      // was not opened by script.
      try {
        window.resizeTo(targetOuterWidth, targetOuterHeight)
        // After a successful resize, the 'resize' event listener in the useEffect
        // should update the `showMap` state, which in turn allows AddressSection to show the map.
      } catch {
        // Optionally, you could inform the user to manually resize the window.
      }
    }
  }

  const ratio = siteFooterLogo.width / siteFooterLogo.height
  // Ensure the logo doesn't exceed 54px in height
  const logoHeight = Math.min(54, siteFooterLogo.height)
  const logoWidth = logoHeight * ratio

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={{ xs: 2, sm: 3, md: 4 }}>
          {showLogo && (
            <Image
              alt={siteName}
              width={logoWidth}
              height={logoHeight}
              src={siteFooterLogo.url}
            />
          )}
          <Stack spacing={1.25}>
            <Typography
              variant="h2"
              sx={{
                lineHeight: { xs: 1, sm: 1, md: 1 },
                maxWidth: { xs: '280px', sm: '100%' }
              }}
            >
              How Much is{' '}
              <span style={{ whiteSpace: 'nowrap' }}>My Home worth?</span>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: { xs: 1, sm: 1, md: 1 },
                maxWidth: { xs: '280px', sm: '100%' }
              }}
            >
              Enter your address to get your free estimate instantly.
            </Typography>
          </Stack>
        </Stack>
        <Box
          sx={{
            '& .MuiFormControl-root': {
              position: 'relative'
            },
            // move the helper error text to the top of the input
            '& .MuiFormHelperText-root': {
              position: 'absolute',
              top: -11,
              left: -4,
              px: 0.5,
              bgcolor: 'background.paper'
            }
          }}
        >
          {/* force-style the Autocomplete popper that's lifted to the body */}
          <GlobalStyles
            styles={{
              ...(iframeWindow && {
                'html, body': {
                  margin: 0,
                  padding: 0,
                  height: '100%',
                  overflow: 'hidden'
                }
              }),
              '.MuiAutocomplete-noOptions': {
                padding: '6px 8px !important',
                fontSize: '0.875rem !important'
              },
              '.MuiAutocomplete-loading': {
                padding: '6px 8px !important',
                fontSize: '0.875rem !important'
              },
              '.MuiAutocomplete-listbox': {
                paddingTop: '2px !important',
                maxHeight: '86px !important'
              },
              '.MuiAutocomplete-option': {
                minHeight: '0 !important',
                paddingLeft: '2px !important',
                paddingRight: '2px !important',
                paddingBottom: '0 !important'
              },
              '.MuiAutocomplete-option:last-child': {
                paddingBottom: '2px !important'
              },
              '.MuiAutocomplete-option .MuiBox-root': {
                padding: '2px 8px !important',
                fontSize: '0.875rem !important'
              }
            }}
          />
          <AddressSection
            showMap={showMap}
            onSubmit={onSubmit}
            onMapReady={handleMapAvailability}
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default Step0Embedded
