'use client'

import React from 'react'

import { Box, Paper, Stack } from '@mui/material'

import { inventoryColors } from '@configs/colors'
import { EstimateDetailsContainer } from '@pages/estimate/ResultPageContent/components'
import { ChartBulletList } from '@shared/Stats'

import { labels } from './constants'
import InventoryChart from './InventoryChart'

const InventoryGraph = ({ value }: { value: number }) => {
  return (
    <Paper
      sx={{
        '&>.MuiStack-root': { flex: 1, height: '100%', boxSizing: 'border-box' }
      }}
    >
      <EstimateDetailsContainer title="Inventory Graph">
        <Stack
          spacing={{ xs: 2, sm: 0, md: 3 }}
          direction={{ xs: 'column', sm: 'row', md: 'column' }}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flex: 1,
            width: '100%',
            height: '100%'
          }}
        >
          <Stack
            spacing={{ xs: 2, sm: 3 }}
            direction="column"
            justifyContent="space-between"
            sx={{
              flex: 1,
              width: '100%',
              height: '100%',
              minWidth: '50%'
            }}
          >
            <InventoryChart value={value} />
          </Stack>
          <Box
            sx={{
              minWidth: '50%',
              width: '100%',
              pt: { xs: 0, sm: 6, md: 0 },

              '& .MuiTypography-body2': {
                fontSize: '0.75rem'
              },

              '& > .MuiStack-root': {
                mx: 'auto',
                width: { sm: 140, md: '100%' },
                justifyContent: 'space-evenly',
                flexDirection: { sm: 'column', md: 'row' },

                '& > .MuiStack-root': {
                  width: { xs: 72, sm: 'auto', md: 72, lg: 'auto' }
                }
              }
            }}
          >
            <ChartBulletList labels={labels} colors={inventoryColors} />
          </Box>
        </Stack>
      </EstimateDetailsContainer>
    </Paper>
  )
}

export default InventoryGraph
