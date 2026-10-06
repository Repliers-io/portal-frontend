'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import parcelFacts from '@configs/parcel-facts'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useParcel } from 'providers/ParcelProvider'
import { createResolver, filterEmptyGroups } from 'utils/dataMapper'

/**
 * The county assessor's record for the parcel this listing stands on, in the same
 * grid as Home Details above it.
 *
 * Renders nothing at all unless a parcel was matched AND its record carries something
 * to show: the filled columns run from four to ninety-two depending on the county, and
 * `filterEmptyGroups` is what decides — no per-field branching here.
 *
 * `heading` off where the surroundings already name the parcel (the parcel dialog).
 */
export const ParcelFacts = ({ heading = true }: { heading?: boolean }) => {
  const { record } = useParcel()
  const t = useTranslations()

  const groups = useMemo(
    () =>
      record
        ? filterEmptyGroups(
            parcelFacts.groups.map((group) => ({
              ...group,
              items: createResolver(group.items, record)
            }))
          )
        : [],
    [record]
  )

  if (!groups.length) return null

  return (
    <Stack spacing={{ xs: 3, sm: 4 }} id="parcel-facts">
      {heading && <Typography variant="h4">{t(parcelFacts.name)}</Typography>}
      <DetailsList mode="columns">
        {/* No `breakInside="auto"` here, unlike Home Details: these groups are short
            enough to sit whole in a column, and a two-row group split across the gap
            reads as two unrelated fragments. */}
        {groups.map((group, index) => (
          <DetailsGroup key={index} group={group} />
        ))}
      </DetailsList>
    </Stack>
  )
}
