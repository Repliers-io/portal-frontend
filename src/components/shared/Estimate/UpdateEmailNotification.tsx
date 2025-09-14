import React, { useState } from 'react'

import {
  type ButtonProps,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack
} from '@mui/material'

import type { EstimateData } from '@configs/estimate'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import useSnackbar from 'hooks/useSnackbar'
import { toRem } from 'utils/theme'

interface UpdateEmailNotificationProps extends ButtonProps {
  estimateData: EstimateData
  label?: string
}

const UpdateEmailNotification: React.FC<UpdateEmailNotificationProps> = ({
  estimateData,
  label = 'Monthly Notifications'
}) => {
  const { sendEmailMonthly, estimateId } = estimateData || {}
  const { updateEstimate } = useAgentEstimates()
  const [loading, setLoading] = useState(false)
  const [checkedState, setCheckedState] = useState(sendEmailMonthly)
  const { showSnackbar } = useSnackbar()

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!estimateId) return
    const { checked } = event.target
    try {
      setLoading(true)
      await updateEstimate(estimateId, { sendEmailMonthly: checked })
      setCheckedState(checked)
      showSnackbar('Email settings updated', 'success')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      showSnackbar('Error updating email settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const iconLoading = loading ? (
    <Stack width={28} height={28} alignItems="center" justifyContent="center">
      <CircularProgress size={16} thickness={5} color="secondary" />
    </Stack>
  ) : undefined

  return (
    <Stack
      gap={2}
      direction="row"
      alignItems="center"
      sx={{
        '& .Mui-disabled, & .MuiTypography-root.Mui-disabled': {
          color: '#BDBDBD !important' // TODO: fix hardcoded color
        },
        '& .MuiCheckbox-root': {
          padding: 0,
          width: 28,
          height: 28
        },
        '& .MuiFormControlLabel-root': {
          // flexDirection: 'row-reverse',
          gap: 1
        },
        '& .MuiTypography-root': {
          fontWeight: 'bold',
          fontSize: toRem(16),
          lineHeight: toRem(24),
          color: 'text.hint'
        },
        '& label': {
          margin: 0
        }
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={checkedState}
            disabled={loading}
            color="secondary"
            icon={iconLoading}
            checkedIcon={iconLoading}
            sx={{ color: 'secondary.main' }}
            onChange={handleChange}
          />
        }
        label={label}
      />
    </Stack>
  )
}

export default UpdateEmailNotification
