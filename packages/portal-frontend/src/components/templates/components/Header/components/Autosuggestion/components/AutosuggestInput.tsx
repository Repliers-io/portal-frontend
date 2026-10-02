import React from 'react'
import { useTranslations } from 'next-intl'

import { CircularProgress, TextField } from '@mui/material'
import { type AutocompleteRenderInputParams } from '@mui/material/Autocomplete'

import { noAutofillInputProps } from 'utils/inputAttrs'

interface AutosuggestInputProps {
  params: AutocompleteRenderInputParams
  loading: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
  placeholder?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
}

export const AutosuggestInput: React.FC<AutosuggestInputProps> = ({
  params,
  loading,
  inputRef,
  placeholder,
  startAdornment,
  endAdornment
}) => {
  const t = useTranslations()
  const resolvedPlaceholder = placeholder ?? t('Search.autosuggestPlaceholder')

  return (
    <TextField
      {...params}
      variant="filled"
      inputRef={inputRef}
      placeholder={resolvedPlaceholder}
      slotProps={{
        input: {
          ...params.InputProps,
          startAdornment,
          endAdornment: loading ? (
            <CircularProgress
              size={18}
              sx={{
                position: 'absolute',
                right: 18
              }}
            />
          ) : (
            (endAdornment ?? params.InputProps.endAdornment)
          )
        },

        htmlInput: {
          ...params.inputProps,
          name: 'search-autosuggest-field-nofill',
          ...noAutofillInputProps
        }
      }}
    />
  )
}
