import React, { type MouseEvent, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack
} from '@mui/material'

import aiConfig from '@configs/ai-search'
import {
  AiIcon,
  CloseIcon,
  ExpandLessIcon,
  ExpandMoreIcon
} from '@configs/icons'

import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'
import { sentenceCase } from 'utils/strings'

export const AiSpacesSelect = ({ size }: { size?: 'medium' | 'small' }) => {
  const t = useTranslations()
  const clientSide = useClientSide()
  const [showDelete, setShowDelete] = useState(false)
  const { filters, setFilter, removeFilter } = useSearch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const value = filters.coverImage
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleMenuItemClick = (value: string) => {
    setFilter('coverImage', value)

    setShowDelete(true)
    setAnchorEl(null)
  }

  const handleReset = (e: React.SyntheticEvent) => {
    removeFilter('coverImage')

    setShowDelete(false)
    setAnchorEl(null)

    e.stopPropagation()
    e.preventDefault()
  }

  useEffect(() => {
    if (value && !open) setShowDelete(true)
  }, [open, value])

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 54, sm: 162 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  return (
    <Box>
      <Button
        size={size}
        disableRipple
        component="div"
        color="secondary"
        variant="outlined"
        onClick={handleMenuOpen}
        sx={{
          px: 1.5,
          minWidth: { xs: 140, sm: 162 },

          // active state border
          '&::after': {
            zIndex: 1,
            content: '""',
            position: 'absolute',
            top: -1,
            right: -1,
            bottom: -1,
            left: -1,
            border: 2,
            borderWidth: 2,
            borderRadius: 1,
            opacity: open ? 1 : 0,
            borderColor: 'secondary.main'
          }
        }}
        endIcon={
          showDelete ? (
            <Box sx={{ minWidth: 16 }}>
              <IconButton
                size="small"
                sx={{
                  right: 4,
                  top: '50%',
                  zIndex: 10,
                  position: 'absolute',
                  color: 'secondary.main',
                  transform: 'translateY(-50%)',
                  '&:hover': { bgcolor: 'background.default' }
                }}
                onClick={handleReset}
              >
                <CloseIcon sx={{ width: 20, height: 20 }} />
              </IconButton>
            </Box>
          ) : open ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )
        }
      >
        <Box
          sx={{
            pr: 1,
            zIndex: 2,
            width: '100%',
            textAlign: 'left',
            position: 'relative',
            whiteSpace: 'nowrap'
          }}
        >
          {value && sentenceCase(value)}&nbsp;
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            className={open || value ? 'floating' : undefined}
            sx={{
              top: 0,
              left: 0,
              position: 'absolute',
              transformOrigin: 'top left',
              transition: 'transform 0.2s cubic-bezier(0.0, 0, 0.2, 1)',
              transform:
                open || value
                  ? size === 'small'
                    ? 'translate(0, -15px) scale(0.75)'
                    : 'translate(0, -19px) scale(0.75)'
                  : '',
              '&::before': {
                content: '""',
                top: 0,
                zIndex: -1,
                left: '-8px',
                right: '-8px',
                height: '16px',
                position: 'absolute',
                bgcolor: 'common.white',
                transition: 'opacity 0.1s linear',
                opacity: open || value ? 1 : 0
              }
            }}
          >
            <AiIcon />
            <Box sx={{ whiteSpace: 'nowrap' }}>{t('MapFilters.aiCovers')}</Box>
          </Stack>
        </Box>
      </Button>

      <Menu
        open={open}
        elevation={3}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 48,
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        slotProps={{ list: { role: 'listbox' } }}
        sx={{ '& .MuiPaper-root': { minWidth: 160 } }}
      >
        {aiConfig.spaces.map((item) => (
          <MenuItem
            key={item}
            selected={item === value}
            onClick={() => handleMenuItemClick(item)}
          >
            {sentenceCase(item)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
