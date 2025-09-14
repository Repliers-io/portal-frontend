'use client'

import { useState } from 'react'

import { Box, Container, Stack, Typography } from '@mui/material'

import { FeedbackForm, UnsubscribeForm } from './components'

type SubscriptionState = 'active' | 'inactive' | 'feedback'

const UnsubscribePageContent = () => {
  const [subscription, setSubscription] = useState<SubscriptionState>('active')

  return (
    <Box>
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center" py={4}>
          <Typography variant="h1" align="center" sx={{ pt: 4 }}>
            Email preferences
          </Typography>
          {subscription === 'active' ? (
            <UnsubscribeForm onSubmit={() => setSubscription('inactive')} />
          ) : subscription === 'inactive' ? (
            <FeedbackForm onSubmit={() => setSubscription('feedback')} />
          ) : (
            <Typography align="center">Thank you for your feedback.</Typography>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

export default UnsubscribePageContent
