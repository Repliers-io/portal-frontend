'use client'

import { useEffect, useState } from 'react'
import queryString from 'query-string'

import { Box } from '@mui/material'

import routes from '@configs/routes'

import { useEstimate } from 'providers/EstimateProvider'

import { Step0Embedded } from '../EstimateFormSteps'

import { LoadingView, SubmitConfirmation } from './components'

const closeWindowDelay = 3000 // 3 seconds
const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

const EstimateEmbeddedForm = () => {
  const { resetForm } = useEstimate()
  const [showLoading, setShowLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const iframeWindow =
    typeof window !== 'undefined' && window.self !== window.top // child window

  const handleSubmit = () => {
    const params = queryString.stringify({ step: 1, external: true })
    const url = `${domain}${routes.estimate}?${params}`

    // there is no reason to show confirmation text in iframe,
    // since we are updating the parent window url and it is going to
    // disappear instantly
    if (iframeWindow) {
      setShowLoading(true)
    } else {
      setShowConfirmation(true)
    }

    const target = iframeWindow ? '_top' : '_blank'

    try {
      const handler = window.open(url, target)
      // WARN: iframe fallback
      // if the change of parent window url was blocked by the browser,
      // we need to open a new window / tab with estimate form
      if (iframeWindow && !handler) {
        setShowConfirmation(true)
        window.open('url', '_blank')
      }
    } catch (error) {
      console.error('Error opening new window:', error)
    }
    // close CURRENT window, if available
    setTimeout(() => window.close(), closeWindowDelay)
  }

  const handleReset = () => {
    setShowConfirmation(false)
    resetForm()
  }

  useEffect(() => {
    setShowLoading(false)
  }, [])

  return (
    <Box
      sx={{
        minHeight: { xs: 326, sm: 234 },
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {showConfirmation ? (
        <SubmitConfirmation onReset={handleReset} />
      ) : showLoading ? (
        <LoadingView />
      ) : (
        <Step0Embedded onSubmit={handleSubmit} />
      )}
    </Box>
  )
}

export default EstimateEmbeddedForm
