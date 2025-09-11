import React, { useState } from 'react'

import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { Button, type ButtonProps, CircularProgress } from '@mui/material'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import useSnackbar from 'hooks/useSnackbar'

interface SendEstimateButtonProps extends ButtonProps {
  estimateId: number
  label?: string
  icon?: React.ReactNode
}

const SendEstimateButton: React.FC<SendEstimateButtonProps> = ({
  estimateId,
  label = 'Send Email',
  icon = <MailOutlineIcon />,
  ...rest
}) => {
  const { sendEstimateEmail } = useAgentEstimates()
  const [loading, setLoading] = useState(false)
  const { showSnackbar } = useSnackbar()

  const handleClick = async () => {
    try {
      setLoading(true)
      await sendEstimateEmail(estimateId)
      showSnackbar('Email sent successfully', 'success')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      showSnackbar('Error sending email', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="text"
      color="secondary"
      sx={{
        whiteSpace: 'nowrap',
        '& .MuiButton-loadingIndicator': {
          color: 'secondary.main'
        }
      }}
      startIcon={
        loading ? (
          <CircularProgress
            size={16}
            thickness={5}
            color="secondary"
            sx={{ mx: 0.25 }}
          />
        ) : (
          icon
        )
      }
      onClick={handleClick}
      {...rest}
    >
      {label}
    </Button>
  )
}

export default SendEstimateButton
