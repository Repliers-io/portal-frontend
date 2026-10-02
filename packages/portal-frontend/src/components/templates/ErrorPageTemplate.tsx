'use client'

import React, { useEffect } from 'react'

import { Button } from '@mui/material'

import { FullscreenView } from 'components/atoms'

export type ErrorPageProps = {
  error: Error
  reset?: () => void
}

const staging = process.env.NEXT_PUBLIC_STAGING === 'true'

export const ErrorPageTemplate = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error('[ErrorPageTemplate]', error)
  }, [error])

  if (staging) return null

  return (
    <FullscreenView title="500" subtitle="Ooops! Something went wrong!">
      {reset && (
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
      )}
    </FullscreenView>
  )
}
