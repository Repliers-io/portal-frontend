import { IconButton, InputAdornment, TextField } from '@mui/material'

import { CloseIcon, SearchIcon } from '@configs/icons'

import { noAutofillInputProps } from 'utils/inputAttrs'

export const SearchField = ({
  value,
  placeholder,
  onChange
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) => (
  <TextField
    fullWidth
    size="small"
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="text.secondary" size={16} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <IconButton onClick={() => onChange('')}>
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null
      },
      htmlInput: { name: 'features-search-nofill', ...noAutofillInputProps }
    }}
  />
)
