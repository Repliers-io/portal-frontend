import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Typography } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import {
  type DetailsGroupType,
  type DetailsItemType,
  isEmptyValue
} from 'utils/dataMapper'
import { safeTranslate } from 'utils/translation'

import DetailsItem from './DetailsItem'

const isEmptyGroup = (items: DetailsItemType[]): boolean => {
  return items.every((item) => isEmptyValue(item.value))
}

const DetailsGroup = ({
  group,
  breakInside = 'avoid',
  scrubbedTitle = '*********',
  scrubbedLabel,
  scrubbedValue
}: {
  group: DetailsGroupType
  breakInside?: CSSStyleDeclaration['breakInside']
  scrubbedTitle?: string
  scrubbedLabel?: string
  scrubbedValue?: string
}) => {
  const { title, items } = group
  const t = useTranslations()

  if (isEmptyGroup(items)) return null

  return (
    <Box sx={{ breakInside }}>
      {Boolean(title) && (
        <Typography component="h5" fontWeight={600} pb={1}>
          <ScrubbedText replace={scrubbedTitle}>
            {safeTranslate(t, title || '')}
          </ScrubbedText>
        </Typography>
      )}

      {items.map((section) => {
        const { label, value } = section
        if (isEmptyValue(value)) return null

        return (
          <DetailsItem
            key={label}
            item={{ ...section, label: safeTranslate(t, label || '') }}
            scrubbedLabel={scrubbedLabel}
            scrubbedValue={scrubbedValue}
          />
        )
      })}
    </Box>
  )
}

export default DetailsGroup
