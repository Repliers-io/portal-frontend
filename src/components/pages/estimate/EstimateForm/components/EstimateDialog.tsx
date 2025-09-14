import React from 'react'

import { Paper } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'

import { EstimateBackground } from '.'

const EstimateDialog = ({ children }: { children: React.ReactNode }) => {
  const { step } = useEstimate()
  const { agentRole } = useUser()
  const collapsed = step === 0 && !agentRole

  return (
    <EstimateBackground collapsed={collapsed}>
      <Paper
        sx={{
          border: 0,
          width: '100%',
          boxSizing: 'border-box',
          // NOTE: Papers have default transition to change opacity and boxShadow
          // which causes blinking effect when going back to step 0
          transition: 'none',
          ...(collapsed
            ? {
                boxShadow: 0,
                borderRadius: 0,
                bgcolor: 'transparent'
              }
            : {
                px: { xs: 2, sm: 3, md: 5 },
                py: { xs: 2, sm: 3, md: 5 },
                boxShadow: { xs: 0, sm: 2 },
                borderRadius: { xs: 0, sm: 3 },
                bgcolor: 'background.default',
                height: { xs: '100vh', sm: 'auto' }
              })
        }}
      >
        {children}
      </Paper>
    </EstimateBackground>
  )
}

export default EstimateDialog
