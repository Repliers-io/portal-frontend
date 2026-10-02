import { useTranslations } from 'next-intl'

import {
  Box,
  IconButton,
  TextField,
  type TextFieldVariants
} from '@mui/material'

import { CloseIcon } from '@configs/icons'

import { SelectLabel } from 'components/atoms'

import { type Filters } from 'services/Search'

export const SearchFilter = ({
  value,
  onChange,
  onSubmit,
  variant
}: {
  value: string | undefined
  onChange: (filters: Partial<Filters>) => void
  onSubmit: () => void
  variant?: TextFieldVariants
}) => {
  const t = useTranslations('MapFilters')

  return (
    <Box>
      <SelectLabel>{t('search')}</SelectLabel>
      <TextField
        fullWidth
        variant={variant}
        value={value || ''}
        onChange={(e) => onChange({ search: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={t('searchPlaceholder')}
        slotProps={{
          input: {
            endAdornment: value ? (
              <IconButton onClick={() => onChange({ search: '' })}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        }}
      />
    </Box>
  )
}
