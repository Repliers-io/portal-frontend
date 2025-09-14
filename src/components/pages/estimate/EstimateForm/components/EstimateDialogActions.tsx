import React, { useEffect, useState } from 'react'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'

import { CompletedDialog, NavigationBar } from '.'

const EstimateDialogActions = () => {
  const { agentRole } = useUser()
  const { step, calculating, editing, estimateId, estimateError } =
    useEstimate()
  const [openDialog, setOpenDialog] = useState(false)

  const showControls = agentRole || step > 0

  useEffect(() => {
    const timer = setTimeout(() => {
      // first time filled the form for new property
      if (
        calculating &&
        !editing &&
        !estimateId &&
        !estimateError &&
        !agentRole
      ) {
        setOpenDialog(true)
      }
    }, 1000) // delay to show the dialog
    // NOTE: a bit of trickery here, as the real calculation of the estimate
    // takes several seconds, but errors are shown instantly

    return () => clearTimeout(timer) // cleanup timer on unmount
  }, [calculating, editing, estimateId, estimateError])

  useEffect(() => {
    if (estimateError) {
      setOpenDialog(false)
    }
  }, [estimateError])

  return (
    <>
      {showControls && <NavigationBar />}
      <CompletedDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </>
  )
}

export default EstimateDialogActions
