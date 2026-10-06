import { IconButton, InputAdornment, TextField } from '@mui/material'

import { CloseIcon, SearchIcon } from '@configs/icons'

import { noAutofillInputProps } from 'utils/inputAttrs'

// the docked search: 16px, the theme's field (12px + a 24px line + 12px), 16px; the
// expanded titles dock right under it
export const searchBarHeight = 80

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
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    // the chat input's 12px from the glyph to the text
    sx={{ '& .MuiInputBase-input': { pl: 1.5 } }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start" sx={{ m: 0 }}>
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
