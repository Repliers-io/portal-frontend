import React, { useRef, useState } from 'react'

import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Tooltip
} from '@mui/material'

import IcoAi from '@icons/IcoAi'

import {
  activeBgColor,
  aiColor,
  placeholderContinueValue,
  placeholderOpenValue,
  placeholderStartValue
} from '../constants'

const ChatInput = ({
  open = false,
  loading = false,
  placeholder = 'start',
  onSubmit,
  onReset,
  onFocus,
  onBlur
}: {
  open: boolean
  loading: boolean
  placeholder: 'start' | 'continue'
  onSubmit?: (value: string) => void
  onReset?: () => void
  onFocus?: () => void
  onBlur?: () => void
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  const validInput = value.length > 3

  const showResetButton = placeholder === 'continue'

  const placeholderValue = open
    ? placeholderOpenValue
    : placeholder === 'continue'
      ? placeholderContinueValue
      : placeholderStartValue

  const bgcolor = !open || placeholder === 'start' ? 'background.paper' : ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validInput) {
      onSubmit?.(value)
      setValue('')
    }
  }

  const handleResetClick = (e: React.MouseEvent) => {
    onReset?.()

    e.stopPropagation()
    e.preventDefault()
  }

  const startAdornment = (
    <InputAdornment
      position="start"
      sx={{ m: 0, p: 0, bgcolor: 'transparent' }}
    >
      {loading ? (
        <CircularProgress size={16} sx={{ color: aiColor, mx: '2px' }} />
      ) : (
        <Box sx={{ width: 20, height: 20 }}>
          <IcoAi />
        </Box>
      )}
    </InputAdornment>
  )

  const endAdornment = showResetButton ? (
    <InputAdornment
      position="end"
      sx={{ m: 0, mx: -0.5, p: 0, bgcolor: 'transparent' }}
    >
      <Tooltip
        arrow
        placement={open ? 'top-end' : 'right'}
        title="Reset filters and start over"
      >
        <Button
          size="small"
          color="secondary"
          onClick={handleResetClick}
          sx={{
            mr: -0.5,
            width: 32,
            height: 32,
            minWidth: 'auto'
          }}
        >
          <RestartAltOutlinedIcon fontSize="small" />
        </Button>
      </Tooltip>
    </InputAdornment>
  ) : null

  return (
    <TextField
      inputRef={ref}
      value={value}
      color="secondary"
      placeholder={placeholderValue}
      onChange={handleInputChange}
      onKeyUp={handleEnterPress}
      onFocus={onFocus}
      onBlur={onBlur}
      sx={{
        width: '100%',
        borderRadius: 1,
        '& *': { border: '0 !important' },
        '& input': { py: '0 !important', height: '44px !important' }, // fix jumping scroll position when focusing input
        '& .MuiOutlinedInput-root': {
          transition: 'background 0.15s linear',
          bgcolor, // see constant defined above
          '&:hover': {
            bgcolor: activeBgColor,
            '& fieldset': { border: 0 }
          },
          '&.Mui-focused': {
            border: 0,
            bgcolor: activeBgColor
          }
        },
        '& .MuiInputBase-input': {
          px: 1.5,
          '&::placeholder': { color: 'secondary.main' }
        }
      }}
      slotProps={{
        input: {
          autoComplete: 'off',
          startAdornment,
          endAdornment
        }
      }}
    />
  )
}

export default ChatInput
