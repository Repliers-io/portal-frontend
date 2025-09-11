/* eslint-disable react/no-array-index-key */

'use client'

import React, { useState } from 'react'

import { Box, Tab, Tabs } from '@mui/material'

import { widgetSpacing } from '@configs/cards-grids'
import { type PropertyClass } from '@configs/filters'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { type StatsParams, StatsTabPanel } from '.'

const tabs: { label: string; propertyClass: PropertyClass }[] = [
  { label: 'Residential', propertyClass: 'residential' },
  { label: 'Condos', propertyClass: 'condo' },
  { label: 'All', propertyClass: 'all' }
]

type StatsTabsProps = Omit<StatsParams, 'propertyClass'> & {
  onTabChange?: (propertyClass: PropertyClass) => void
}

export const StatsTabs = ({
  city,
  neighborhood,
  onTabChange
}: StatsTabsProps) => {
  const clientSide = useClientSide()
  // center tabs on mobiles and right align on larger screens
  const { desktop } = useBreakpoints()
  const [value, setValue] = useState(0)

  const handleChange = (_event: React.SyntheticEvent, value: string) => {
    const numberValue = parseInt(value, 10)
    setValue(numberValue)
    onTabChange?.(tabs[numberValue].propertyClass)
  }

  return (
    <Box>
      {clientSide ? (
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            '& .MuiTabs-flexContainer': {
              position: 'relative',
              justifyContent: desktop ? 'flex-end' : 'center',
              borderColor: 'common.black',
              borderBottom: '1px solid'
            },

            '& .MuiTab-root': {
              px: 3,
              py: 0,
              ml: 1,
              color: 'common.white',
              bgcolor: 'primary.dark',
              borderRadius: '4px 4px 0 0',

              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'common.white'
              }
            }
          }}
          slotProps={{
            indicator: {
              sx: { display: 'none' }
            }
          }}
        >
          {tabs.map(({ label }, index) => (
            <Tab key={index} value={index} label={label} />
          ))}
        </Tabs>
      ) : (
        <Box height={48} /> // spacer for loading
      )}
      <Box position="relative">
        {tabs.map(({ label, propertyClass }, index) => (
          <Box
            key={index}
            sx={{
              px: 0,
              pt: widgetSpacing,
              display: index === value ? 'block' : 'none'
            }}
          >
            <StatsTabPanel
              city={city}
              label={label}
              neighborhood={neighborhood}
              propertyClass={propertyClass}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
