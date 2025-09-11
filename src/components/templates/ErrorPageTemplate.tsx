'use client'

import React, { useEffect } from 'react'

import { Button } from '@mui/material'

import { FullscreenView } from 'components/atoms'

import { PageTemplate } from '.'

export type ErrorPageProps = {
  error: Error
  reset?: () => void
}

const ErrorPageTemplate = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[ErrorPageTemplate]', error)
  }, [error])

  return (
    <PageTemplate>
      <FullscreenView title="500" subtitle="Ooops! Something went wrong!">
        {reset && (
          <Button variant="contained" onClick={reset}>
            Try again
          </Button>
        )}
      </FullscreenView>
    </PageTemplate>
  )
}

export default ErrorPageTemplate
