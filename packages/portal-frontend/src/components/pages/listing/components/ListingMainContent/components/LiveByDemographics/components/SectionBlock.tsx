'use client'

import { Box, Divider, Stack, Typography } from '@mui/material'

import type {
  LiveByAgeSection,
  LiveByContentItem,
  LiveByDemographicsSection,
  LiveByDistributionGroup,
  LiveByScalarMetric
} from '../types'

import { AgeDistributionChart } from './AgeDistributionChart'
import { DistributionItem } from './DistributionItem'
import { ScalarStatistic } from './ScalarStatistic'

type ScalarGroup = LiveByScalarMetric[]
type DistributionGrid = {
  kind: 'distribution-grid'
  columns: number
  items: LiveByDistributionGroup[]
}
type ContentGroup =
  | ScalarGroup
  | DistributionGrid
  | LiveByDistributionGroup
  | LiveByAgeSection

const groupContent = (items: LiveByContentItem[]): ContentGroup[] =>
  items.reduce<ContentGroup[]>((acc, item) => {
    if (item.kind === 'scalar') {
      const last = acc[acc.length - 1]
      if (Array.isArray(last)) {
        last.push(item)
      } else {
        acc.push([item])
      }
    } else if (item.kind === 'distribution' && item.columns) {
      const last = acc[acc.length - 1]
      if (
        last &&
        !Array.isArray(last) &&
        last.kind === 'distribution-grid' &&
        last.columns === item.columns
      ) {
        last.items.push(item)
      } else {
        acc.push({
          kind: 'distribution-grid',
          columns: item.columns,
          items: [item]
        })
      }
    } else {
      acc.push(item)
    }
    return acc
  }, [])

export const SectionBlock = ({
  section,
  divider = false,
  hideZero = false
}: {
  section: LiveByDemographicsSection
  divider?: boolean
  hideZero?: boolean
}) => (
  <Stack spacing={2}>
    {divider && <Divider />}
    <Typography variant="subtitle1" fontWeight={700}>
      {section.title}
    </Typography>
    <Stack spacing={3}>
      {groupContent(section.content).map((group, i) => {
        if (Array.isArray(group)) {
          if (section.scalarColumns) {
            return (
              <Box
                key={i}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: `repeat(${section.scalarColumns}, 1fr)`
                  },
                  gap: 2
                }}
              >
                {group.map(({ label, value }, j) => (
                  <ScalarStatistic key={j} label={label} value={value} />
                ))}
              </Box>
            )
          }
          return (
            <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {group.map(({ label, value }, j) => (
                <Box
                  key={j}
                  sx={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }}
                >
                  <ScalarStatistic label={label} value={value} />
                </Box>
              ))}
            </Stack>
          )
        }
        if (group.kind === 'distribution-grid') {
          return (
            <Box
              key={i}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: `repeat(${group.columns}, 1fr)`
                },
                rowGap: 3,
                columnGap: 5
              }}
            >
              {group.items.map((item, j) => (
                <Box
                  key={j}
                  sx={
                    item.span && item.span > 1
                      ? { gridColumn: { xs: '1', sm: `span ${item.span}` } }
                      : undefined
                  }
                >
                  <DistributionItem {...item} hideZero={hideZero} />
                </Box>
              ))}
            </Box>
          )
        }
        if (group.kind === 'distribution') {
          return <DistributionItem key={i} {...group} hideZero={hideZero} />
        }
        return (
          <AgeDistributionChart key={i} ages={group.ages} hideZero={hideZero} />
        )
      })}
    </Stack>
  </Stack>
)
