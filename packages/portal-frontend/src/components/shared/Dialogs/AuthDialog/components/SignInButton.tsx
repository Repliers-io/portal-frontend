import React from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@mui/material'

const SignInButton = ({
  loading,
  disabled
}: {
  loading?: boolean
  disabled?: boolean
}) => {
  const t = useTranslations('Forms')

  return (
    <Button
      type="submit"
      size="large"
      variant="contained"
      loading={loading}
      disabled={disabled || loading}
      sx={{ width: 200 }}
    >
      {t('signInButton')}
    </Button>
  )
}

export default SignInButton
