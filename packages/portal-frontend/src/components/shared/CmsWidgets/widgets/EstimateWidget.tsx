'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Box, Stack } from '@mui/material'

import { Step0Widget } from '@pages/estimate/EstimateFormSteps'

import EstimateProvider from 'providers/EstimateProvider'
import EstimateStepsProvider from 'providers/EstimateStepsProvider'
import SelectOptionsProvider from 'providers/SelectOptionsProvider'

import { WidgetWrapper } from '../WidgetWrapper'

export interface EstimateWidgetProps {
  /**
   * Widget height in pixels
   * @default 234 (desktop) / 326 (mobile)
   */
  height?: number
  /**
   * Show logo in the form
   * @default false
   */
  showLogo?: boolean
  /**
   * Show map for address confirmation
   * @default true
   */
  showMap?: boolean
  /*
   * Background color
   * @default 'transparent'
   */
  bgcolor?: string
  /**
   * Window target for opening estimate form
   * @default '_blank'
   */
  target?: '_blank' | '_self' | '_top'
  title?: string
  subtitle?: string
  submit?: string
  formAlign?: 'left' | 'right'
}

/**
 * Embedded estimate form widget for use in markdown and other content
 *
 * Usage in MDX:
 * ```
 * <Widget name="EstimateWidget" height={450} showMap={true} />
 * ```
 *
 * Or with bracket syntax:
 * ```
 * [EstimateWidget height=450 showLogo=true showMap=true]
 * ```
 */
export const EstimateWidget = ({
  showMap = false,
  bgcolor = 'background.default',
  target = '_blank',
  title,
  subtitle,
  submit,
  formAlign = 'right'
}: EstimateWidgetProps) => {
  const t = useTranslations('CmsWidgets')

  return (
    <WidgetWrapper maxWidth="lg" bgcolor={bgcolor}>
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Stack
          width="100%"
          spacing={{ xs: 2, md: 4 }}
          direction={{
            xs: 'column',
            md: formAlign === 'left' ? 'row-reverse' : 'row'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                minHeight: 340,
                mr: { xs: 0, md: 4 },
                bgcolor: 'grey.300'
              }}
            >
              <Image
                fill
                sizes="(max-width: 900px) 100vw, 600px"
                loading="lazy"
                src="/estimate-bg.webp"
                alt={t('estimateAlt')}
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </Box>

          <SelectOptionsProvider lazy>
            <EstimateProvider embedded>
              <EstimateStepsProvider>
                <Step0Widget
                  showMap={showMap}
                  target={target}
                  title={title}
                  subtitle={subtitle}
                  submit={submit}
                />
              </EstimateStepsProvider>
            </EstimateProvider>
          </SelectOptionsProvider>
        </Stack>
      </Box>
    </WidgetWrapper>
  )
}
