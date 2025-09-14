import React from 'react'

import type { BoxProps } from '@mui/system'

import { useEstimate } from 'providers/EstimateProvider'
import useClientSide from 'hooks/useClientSide'

import { StepsTabBullet, StepsTabContainer, StepsTabLabel } from '.'

interface StepsTabProps extends BoxProps {
  index: number
  label: string
  validAuth?: boolean
}

const StepsTab: React.FC<StepsTabProps> = ({
  index,
  label,
  validAuth = false // special flag to indicate that user was logged while filling the form
}) => {
  const clientSide = useClientSide()
  const { step, validation, showStep } = useEstimate()

  // show auth step as valid, but do not allow client to click on it
  const available = validation.maxValidated + 1 >= index
  const active = clientSide && step === index
  const valid = validation.status[index]

  return (
    <StepsTabContainer
      index={index}
      active={active}
      available={available && !validAuth}
      onClick={() => showStep(index)}
    >
      <StepsTabBullet active={active} valid={valid} available={!validAuth} />
      <StepsTabLabel available={available && !validAuth}>{label}</StepsTabLabel>
    </StepsTabContainer>
  )
}

export default StepsTab
