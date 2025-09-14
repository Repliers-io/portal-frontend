import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Chip, Stack, Typography } from '@mui/material'

import {
  type DetailsGroupType,
  type DetailsItemType,
  isEmptyValue
} from 'utils/dataMapper'
import { safeTranslate } from 'utils/translation'

const isEmptyGroup = (items: DetailsItemType[]): boolean => {
  return items.every((item) => isEmptyValue(item.value))
}

const DetailsChipsGroup = ({ group }: { group: DetailsGroupType }) => {
  const { title, items } = group
  const t = useTranslations()

  if (isEmptyGroup(items)) return null

  return (
    <Box sx={{ breakInside: 'avoid' }}>
      {Boolean(title) && (
        <Typography component="h5" fontWeight={600} pb={1}>
          {safeTranslate(t, title || '')}
        </Typography>
      )}

      {items.map(({ value }, index1) => {
        const chips = [value].flat() // convert to array if not already
        return (
          <Stack key={index1} spacing={1} direction="row" flexWrap="wrap">
            {chips.map((label, index2) => (
              <Chip
                key={index2}
                label={label}
                sx={{ borderRadius: 1, fontWeight: 500 }}
              />
            ))}
          </Stack>
        )
      })}
    </Box>
  )
}

export default DetailsChipsGroup
