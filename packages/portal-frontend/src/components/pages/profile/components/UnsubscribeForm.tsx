import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

export const UnsubscribeForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const [loading, setLoading] = useState(false)
  const clientSide = useClientSide()
  const { update } = useUser()
  const t = useTranslations('Forms')

  const handleClick = () => {
    setLoading(true)
    try {
      update({
        preferences: {
          sms: false,
          email: false,
          unsubscribe: true
        }
      })
      onSubmit?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={4} alignItems="center">
      <Typography align="center" color="text.hint">
        {t('unsubscribeDescription')}
      </Typography>
      <Button
        size="large"
        variant="contained"
        disabled={!clientSide}
        loading={loading || !clientSide}
        onClick={handleClick}
      >
        {t('unsubscribe')}
      </Button>
    </Stack>
  )
}
