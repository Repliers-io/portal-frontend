import React, { forwardRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Tooltip
} from '@mui/material'

import { AiIcon, RestartAltOutlinedIcon } from '@configs/icons'

import { activeBgColor, aiColor } from '../constants'

export const ChatInput = forwardRef<
  HTMLInputElement,
  {
    loading?: boolean
    disabled?: boolean
    placeholder: 'start' | 'continue'
    onSubmit?: (value: string) => void
    onReset?: () => void
    onFocus?: () => void
    onBlur?: () => void
  }
>(
  (
    {
      loading = false,
      disabled = false,
      placeholder = 'start',
      onSubmit,
      onReset,
      onFocus,
      onBlur
    },
    forwardedRef
  ) => {
    const t = useTranslations()
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)

    const validInput = value.length > 3

    const showResetButton = placeholder === 'continue'

    const placeholderValue =
      placeholder === 'continue'
        ? t('AiChat.continueMessage')
        : t('AiChat.startMessage')

    const bgcolor = placeholder === 'start' ? 'background.paper' : ''

    const handleFocus = () => {
      setFocused(true)
      onFocus?.()
    }

    const handleBlur = () => {
      setFocused(false)
      onBlur?.()
    }

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

      // Focus input after reset
      if (forwardedRef && typeof forwardedRef !== 'function') {
        forwardedRef.current?.focus()
      }
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
            <AiIcon />
          </Box>
        )}
      </InputAdornment>
    )

    const endAdornment = showResetButton ? (
      <InputAdornment
        position="end"
        sx={{ m: 0, mx: -0.5, p: 0, bgcolor: 'transparent' }}
      >
        <Tooltip arrow placement="top-end" title="Reset filters and start over">
          <Button
            size="small"
            color="secondary"
            onClick={handleResetClick}
            sx={{
              mr: -0.25,
              width: 32,
              height: 32,
              minWidth: 'auto',
              borderRadius: '50%'
            }}
          >
            <RestartAltOutlinedIcon fontSize="small" />
          </Button>
        </Tooltip>
      </InputAdornment>
    ) : null

    return (
      <TextField
        inputRef={forwardedRef}
        value={value}
        color="secondary"
        disabled={disabled}
        placeholder={placeholderValue}
        onChange={handleInputChange}
        onKeyUp={handleEnterPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        sx={{
          width: '100%',
          margin: focused ? 0 : '1px',
          border: focused ? 2 : 1,
          borderRadius: '26px',
          borderColor: 'secondary.main',
          // boxShadow: focused ? '0 0 0 4px #FD66, 0 0 0 8px #FD66' : 'none',
          boxShadow: focused ? 1 : 0,
          overflow: 'hidden',
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
)

ChatInput.displayName = 'ChatInput'
