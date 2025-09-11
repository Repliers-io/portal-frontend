import { useState } from 'react'

import { Button, Stack, Typography } from '@mui/material'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

const UnsubscribeForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const [loading, setLoading] = useState(false)
  const clientSide = useClientSide()
  const { update } = useUser()

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
        Click ‘Unsubscribe’ to opt out of all future communications from HomeIQ.
      </Typography>
      <Button
        size="large"
        variant="contained"
        disabled={!clientSide}
        loading={loading || !clientSide}
        onClick={handleClick}
      >
        Unsubscribe
      </Button>
    </Stack>
  )
}

export default UnsubscribeForm
