'use client'

import React, {
  createContext,
  type ReactNode,
  useContext,
  useMemo
} from 'react'

import { type EstimateStepName } from '@configs/estimate'
import {
  Step0Address,
  Step0AgentAddress,
  Step1BasicDetails,
  Step2HomeDetails,
  Step3AdvancedDetails,
  Step4Intentions,
  Step5Contacts,
  Step6Confirmation
} from '@pages/estimate/EstimateFormSteps'

import { useEstimate } from './EstimateProvider'
import { useUser } from './UserProvider'

type EstimateStepComponentsContextType = {
  stepComponents: ReactNode[]
}

const componentNameMapping: Record<EstimateStepName, React.FC> = {
  address: Step0Address,
  basicDetails: Step1BasicDetails,
  homeDetails: Step2HomeDetails,
  advancedDetails: Step3AdvancedDetails,
  intentions: Step4Intentions,
  contact: Step5Contacts,
  confirmation: Step6Confirmation
}

const EstimateStepsContext = createContext<
  EstimateStepComponentsContextType | undefined
>(undefined)

const EstimateStepsProvider = ({ children }: { children: ReactNode }) => {
  const { agentRole } = useUser()
  const { stepNames } = useEstimate()

  const stepComponents = useMemo(
    () =>
      stepNames.map((key) => {
        const StepComponent = componentNameMapping[key as EstimateStepName]

        // hardcoded component replacement,
        // TODO: lets think of a better way in the future,
        // like [ComponentVariantA, ComponentVariantB] array or something like that for different roles
        if (agentRole && 'address' === key)
          return <Step0AgentAddress key={key} />

        return <StepComponent key={key} />
      }),
    [agentRole, stepNames]
  )

  const contextValue = useMemo(() => ({ stepComponents }), [stepComponents])

  return (
    <EstimateStepsContext.Provider value={contextValue}>
      {children}
    </EstimateStepsContext.Provider>
  )
}

export default EstimateStepsProvider

export const useEstimateSteps = () => {
  const context = useContext(EstimateStepsContext)
  if (!context) {
    throw Error('useEstimateSteps must be used within EstimateStepsProvider')
  }
  return context
}
