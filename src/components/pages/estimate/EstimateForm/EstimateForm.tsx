'use client'

import React, { useEffect } from 'react'

import { Stack } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'
import useBreakpoints from 'hooks/useBreakpoints'

import {
  EstimateDialog,
  EstimateDialogActions,
  EstimateDialogContent,
  StepsContainer,
  StepsContent,
  StepsHeader,
  StepsNavigation,
  StepsTabBar
} from './components'
import { addScrollListeners, removeScrollListeners } from './utils'

const EstimateForm = ({
  escapeKey = true,
  scrollLock = true
}: {
  escapeKey?: boolean
  scrollLock?: boolean
}) => {
  const trackEvent = useAnalytics()
  const { agentRole } = useUser()
  const { desktop } = useBreakpoints()
  const {
    step,
    steps,
    showStep,
    validation,
    editing,
    calculating,
    initiallyLogged: logged,
    getStepErrors,
    estimateId
  } = useEstimate()

  const addressStep = step === 0 && !agentRole

  useEffect(() => {
    if (!validation.status[step]) {
      const errors = getStepErrors(step)
      if (errors.length) {
        const errorField = document.getElementById(`estimate-${errors[0]}`)
        errorField?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }, [validation])

  useEffect(() => {
    if (!scrollLock) return

    if (!addressStep) addScrollListeners()
    else removeScrollListeners()
    return () => removeScrollListeners()
  }, [addressStep, scrollLock])

  useEffect(() => {
    trackEvent('view_estimate_form_step', {
      step: step > steps ? 0 : step,
      editing,
      logged
    })
  }, [step])

  useEffect(() => {
    if (calculating) trackEvent('estimate_form_completed', { editing, logged })
  }, [calculating])

  useEffect(() => {
    if (!estimateId && step > 0) trackEvent('continue_estimate_form', { step })
  }, [])

  useEffect(() => {
    if (!escapeKey) return

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeElement = document.activeElement
        if (
          !(activeElement instanceof HTMLInputElement) &&
          !(activeElement instanceof HTMLTextAreaElement) &&
          !(activeElement instanceof HTMLSelectElement)
        ) {
          showStep(0)
        }
      }
    }

    document.addEventListener('keyup', handleKeyUp)
    return () => document.removeEventListener('keyup', handleKeyUp)
  }, [showStep, escapeKey])

  return (
    <EstimateDialog>
      <Stack spacing={2} width="100%">
        <EstimateDialogContent autoHeight={addressStep}>
          {!addressStep && (
            <StepsNavigation>
              <StepsHeader />
              <StepsTabBar />
            </StepsNavigation>
          )}

          {addressStep ? (
            <StepsContent />
          ) : desktop ? (
            // additional wrapper for desktop layout
            <StepsContainer>
              <StepsContent />
            </StepsContainer>
          ) : null}
        </EstimateDialogContent>

        {!addressStep && <EstimateDialogActions />}
      </Stack>
    </EstimateDialog>
  )
}

export default EstimateForm
