'use client'

import { type ComponentType, useState } from 'react'

import {
  alpha,
  Box,
  ButtonBase,
  type SvgIconProps,
  type SxProps,
  Typography
} from '@mui/material'

import { primary } from '@configs/colors'
import filtersConfig, { type ListingType } from '@configs/filters'
import {
  ListingTypeAllListingsIcon,
  ListingTypeBusinessIcon,
  ListingTypeCommercialIcon,
  ListingTypeCondoIcon,
  ListingTypeCondoTownhomeIcon,
  ListingTypeCoopIcon,
  ListingTypeLandIcon,
  ListingTypeLoftIcon,
  ListingTypeMultiFamilyIcon,
  ListingTypeOtherIcon,
  ListingTypePenthouseIcon,
  ListingTypeResidentialIcon,
  ListingTypeResidentialTownhomeIcon,
  ListingTypeSemiDetachedIcon,
  ListingTypeTownhomeIcon
} from '@configs/icons'

import { defaultRenderMultiValue } from 'components/atoms/FilterSelect'

import { FilterChip } from './FilterChip'
import { useListingTypeLabel } from './useListingTypeLabel'

const { listingTypes } = filtersConfig

const listingTypeIcons: Record<ListingType, ComponentType<SvgIconProps>> = {
  allListings: ListingTypeAllListingsIcon,
  residential: ListingTypeResidentialIcon,
  condo: ListingTypeCondoIcon,
  townhome: ListingTypeTownhomeIcon,
  semiDetached: ListingTypeSemiDetachedIcon,
  multiFamily: ListingTypeMultiFamilyIcon,
  land: ListingTypeLandIcon,
  business: ListingTypeBusinessIcon,
  commercial: ListingTypeCommercialIcon,
  residentialTownhome: ListingTypeResidentialTownhomeIcon,
  condoTownhome: ListingTypeCondoTownhomeIcon,
  coop: ListingTypeCoopIcon,
  penthouse: ListingTypePenthouseIcon,
  loft: ListingTypeLoftIcon,
  other: ListingTypeOtherIcon
}

// the tile grid: three 115px tiles 12px apart
const tile = 115
const gap = 12

type Props = {
  size: 'medium' | 'small'
  disabled?: boolean
  sx?: SxProps
  multiSelect?: boolean
  value: ListingType | ListingType[] | undefined
  onChange: (value: ListingType | ListingType[]) => void
}

/**
 * Listing-type filter as a tile panel — the alternative to `ListingTypeSelect`'s
 * dropdown, with the same chip/popover shell as the other bar filters and the same
 * value contract as `FilterSelect` (single emits a key, multi emits an array on close,
 * `allListings` is the exclusive "all" value).
 */
export const ListingTypePanel = ({
  size,
  sx,
  disabled,
  multiSelect,
  value,
  onChange
}: Props) => {
  const formatListingType = useListingTypeLabel()

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ListingType[] | null>(null)

  const selected = [value].flat().filter(Boolean) as ListingType[]
  const committed = selected.length ? selected : (['allListings'] as const)
  // multi-select emits on close, so chip and tiles follow the draft while open
  const current: readonly ListingType[] =
    multiSelect && draft ? draft : committed

  const label = multiSelect
    ? defaultRenderMultiValue([...current], formatListingType)
    : formatListingType(current[0])

  const handleOpen = () => {
    setDraft(null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (draft) {
      onChange(draft)
      setDraft(null)
    }
  }

  const handleTileClick = (type: ListingType) => {
    if (!multiSelect) {
      onChange(current.includes(type) ? 'allListings' : type)
      setOpen(false)
      return
    }

    // the exclusive tile wipes the rest, and an emptied set falls back to it
    if (type === 'allListings') {
      setDraft(['allListings'])
      return
    }

    const next = current.filter((v) => v !== type && v !== 'allListings')
    setDraft(
      current.includes(type)
        ? next.length
          ? next
          : ['allListings']
        : [...next, type]
    )
  }

  return (
    <FilterChip
      label={
        <Typography variant="body1" component="span">
          {label}
        </Typography>
      }
      size={size}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      // the chip is at its unset width whenever it reads "All listings"
      unset={current.length === 1 && current[0] === 'allListings'}
      disabled={disabled}
      sx={sx}
      skeletonSx={sx}
      paperSx={{ p: 2 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${tile}px)`,
          gap: `${gap}px`
        }}
      >
        {listingTypes.map((type) => {
          const Icon = listingTypeIcons[type]
          const active = current.includes(type)

          return (
            <ButtonBase
              key={type}
              aria-pressed={active}
              onClick={() => handleTileClick(type)}
              sx={{
                flexDirection: 'column',
                gap: '12px',
                width: 114,
                height: 82,
                borderRadius: '8px',
                // a pressed tile fills navy inside a black frame; an idle one takes the
                // regular button hover fill and tints its frame
                border: '2px solid #E7E7E7',
                // the icons stroke with currentColor, so the tile's color drives both
                ...(active
                  ? {
                      bgcolor: 'primary.main',
                      borderColor: 'common.black',
                      color: 'common.white'
                    }
                  : {
                      color: 'common.black',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: alpha(primary, 0.08)
                      }
                    })
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              <Typography
                sx={{
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: 700,
                  color: 'inherit'
                }}
              >
                {formatListingType(type)}
              </Typography>
            </ButtonBase>
          )
        })}
      </Box>
    </FilterChip>
  )
}
