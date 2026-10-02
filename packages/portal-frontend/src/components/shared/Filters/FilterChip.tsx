'use client'

import { type ReactNode, useRef } from 'react'

import {
  alpha,
  Box,
  ButtonBase,
  Popover,
  Skeleton,
  type SxProps,
  type Theme
} from '@mui/material'

import { primary } from '@configs/colors'
import { KeyboardArrowDownIcon } from '@configs/icons'

import useClientSide from 'hooks/useClientSide'

import { useUnsetWidthAnchor } from './useUnsetWidthAnchor'

type FilterChipProps = {
  label: ReactNode
  size: 'medium' | 'small'
  open: boolean
  onOpen: () => void
  onClose: () => void
  /** The chip shows no value — the popover anchors to this width (useUnsetWidthAnchor). */
  unset: boolean
  disabled?: boolean
  sx?: SxProps<Theme>
  skeletonSx?: SxProps<Theme>
  paperSx?: SxProps<Theme>
  children: ReactNode
}

const toArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx])

/** A filter-bar chip with a chevron that opens its filter in a popover under it. */
export const FilterChip = ({
  label,
  size,
  open,
  onOpen,
  onClose,
  unset,
  disabled,
  sx,
  skeletonSx,
  paperSx,
  children
}: FilterChipProps) => {
  const clientSide = useClientSide()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const anchorOrigin = useUnsetWidthAnchor(anchorRef, unset, open)

  const height = size === 'small' ? 32 : 38

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={[{ height, width: 140, borderRadius: 1 }, ...toArray(skeletonSx)]}
      />
    )
  }

  return (
    <>
      <ButtonBase
        ref={anchorRef}
        disabled={disabled}
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.5,
            height,
            px: 2,
            borderRadius: 1,
            bgcolor: 'background.default',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: alpha(primary, 0.08) },
            ...(open && { bgcolor: alpha(primary, 0.12) }),
            transition: 'background-color 150ms cubic-bezier(0.4,0,0.2,1)'
          },
          ...toArray(sx)
        ]}
      >
        {label}
        <Box
          component={KeyboardArrowDownIcon}
          sx={{
            fontSize: '19px',
            flexShrink: 0,
            color: 'primary.main',
            transform: open ? 'rotate(180deg)' : 'none'
          }}
        />
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: [{ mt: '8px' }, ...toArray(paperSx)] } }}
      >
        {children}
      </Popover>
    </>
  )
}
