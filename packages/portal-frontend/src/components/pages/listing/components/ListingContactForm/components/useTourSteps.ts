import { useState } from 'react'
import type { UseFormTrigger } from 'react-hook-form'

import type { ScheduleFormValues } from '@shared/Forms/ScheduleForm'

// The tour request in two steps, when and then who: Next advances once the schema accepts the
// date and the time, Change goes back. The form keeps every value across the switch.
export const useTourSteps = (trigger: UseFormTrigger<ScheduleFormValues>) => {
  const [step, setStep] = useState<1 | 2>(1)

  return {
    step,
    next: async () => {
      if (await trigger(['date', 'time'])) setStep(2)
    },
    change: () => setStep(1)
  }
}
