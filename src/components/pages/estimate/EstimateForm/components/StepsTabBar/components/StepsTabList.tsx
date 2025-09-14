import React, { useMemo, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  lighten
} from '@mui/material'

import { primary } from '@configs/colors'
import { stepsConfiguration } from '@configs/estimate'

import { useEstimate } from 'providers/EstimateProvider'
import { useEstimateSteps } from 'providers/EstimateStepsProvider'
import { useUser } from 'providers/UserProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { StepsTab } from '.'

const StepsTabList = ({ height = 0 }: { height?: number }) => {
  const clientSide = useClientSide()
  const { desktop } = useBreakpoints()
  const { getValues } = useFormContext()
  const { agentRole, logged } = useUser()
  const { stepComponents } = useEstimateSteps()
  const { steps, step, stepNames, editing, initiallyLogged } = useEstimate()

  const listingType = getValues('listingType')

  const summaryRef = useRef<HTMLDivElement>(null)

  // we are freezing _initial_ state of stepNames and labels, as array
  // could drop 2 last steps after user successfully logged in,
  // and we still need to keep all steps visible
  const tabLabels = useMemo(
    () =>
      stepNames.map((key) => {
        const step = stepsConfiguration[key]
        // stepNames are equal to stepConfiguration keys
        return listingType === 'condo' && step!.condoTitle
          ? step!.condoTitle
          : step!.title
      }),
    [listingType]
  )

  if (!clientSide) return null

  const validAuth = !initiallyLogged && logged

  // NOTE: very special case when user started the form without auth,
  // but was successfully logged in in the latest step. In this case,
  // we need to show all steps, but do not allow him to click on
  // the auth/otp/confirmation steps
  const slicedLabels =
    desktop && validAuth ? tabLabels : tabLabels.slice(0, steps)

  const visibleTabs = slicedLabels.map((label, index) => {
    // Zero-step logic: alternative form for Agents
    if (index === 0) {
      if (!agentRole) return null
      if (agentRole && editing) return null
    }

    const activeStep = step === index

    // Desktop: vertical tabs
    if (desktop) {
      return (
        <StepsTab
          index={index}
          label={label}
          key={`${label}-${index}`}
          validAuth={validAuth && index >= steps}
        />
      )
    }

    const summaryHeight = summaryRef.current?.clientHeight || 0

    // Mobile: use Accordion
    return (
      <Accordion
        key={`${label}-${index}`}
        expanded={activeStep}
        sx={{
          boxShadow: 0,
          overflow: 'visible',
          borderRadius: '8px !important',

          '& .MuiAccordionSummary-content': {
            margin: '0 !important'
          },
          '& .MuiAccordion-heading .MuiButtonBase-root.Mui-expanded': {
            borderRadius: '8px 8px 0 0',
            background: lighten(primary, 0.9)
          },
          '& .MuiAccordionSummary-content .MuiBox-root:after': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary ref={summaryRef} expandIcon={<ExpandMoreIcon />}>
          <StepsTab index={index} label={label} />
        </AccordionSummary>
        <AccordionDetails
          sx={{
            pt: { xs: 2, sm: 4 },
            pb: 2,
            boxSizing: 'border-box',
            minHeight: `calc(${height}px - ${summaryHeight}px)` // accordion header height
          }}
        >
          {Boolean(summaryHeight) && stepComponents[index]}
        </AccordionDetails>
      </Accordion>
    )
  })

  return <>{visibleTabs}</>
}

export default StepsTabList
