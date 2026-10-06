import { useTranslations } from 'next-intl'

import { Button } from '@mui/material'

export const AddressSubmit = ({
  onClick,
  loading,
  disabled,
  submit
}: {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  submit?: string
}) => {
  const t = useTranslations()

  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      sx={{ minWidth: { xs: '100%', sm: 180 } }}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      {submit || t('Estimates.getStarted')}
    </Button>
  )
}
