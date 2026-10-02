import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { MenuItem, MenuList, Popover } from '@mui/material'

import { activeBg } from '@configs/colors'
import { MapStyleIcon } from '@configs/icons'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import { capitalize } from 'utils/strings'

import { MapControlButton } from './MapControlButton'

type MapStyle = 'map' | 'hybrid' | 'satellite'
type StyleOption = { name: MapStyle; label: string }

const styleOptions: StyleOption[] = [
  { name: 'satellite', label: capitalize('satellite') },
  { name: 'hybrid', label: capitalize('hybrid') },
  { name: 'map', label: capitalize('map') }
]

export const MapStyleMenu = ({ disabled = false }: { disabled?: boolean }) => {
  const t = useTranslations('Map')
  const clientSide = useClientSide()
  const { style, setStyle } = useMapOptions()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSelect = (value: MapStyle) => {
    setStyle(value)
    handleClose()
  }

  return (
    <>
      <MapControlButton
        ref={anchorRef}
        title={t('styleButtonTooltip')}
        disabled={disabled || !clientSide}
        onClick={handleOpen}
        sx={[open && { bgcolor: activeBg }]}
      >
        <MapStyleIcon sx={{ fontSize: 22 }} />
      </MapControlButton>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'center', horizontal: -16 }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'secondary.main',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12) !important'
            }
          }
        }}
        disableScrollLock
      >
        <MenuList>
          {styleOptions.map(({ name, label }) => (
            <MenuItem
              key={name}
              selected={style === name}
              onClick={() => handleSelect(name)}
            >
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  )
}
