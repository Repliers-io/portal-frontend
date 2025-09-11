import type React from 'react'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { Button, Stack } from '@mui/material'

import type { EstimateData } from '@defaults/estimate'
import IcoEdit from '@icons/IcoEdit'
import { SendEstimateButton } from '@shared/Estimate'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { useDialog } from 'providers/DialogProvider'

export const ButtonsBar = ({
  estimateData
}: {
  estimateData: EstimateData
}) => {
  const { estimateId, ulid } = estimateData || {}
  const { setEstimateToRemove, getEstimateUrl } = useAgentEstimates()
  const { showDialog } = useDialog('confirm-estimate-removal')

  const showConfirmationDialog = () => {
    setEstimateToRemove(estimateData)
    showDialog()
  }

  const estimateUrl = getEstimateUrl(ulid || estimateId)
  const editEstimateUrl = getEstimateUrl(ulid || estimateId, 1)

  const buttonDefinitions = {
    view: {
      icon: <InsertDriveFileOutlinedIcon />,
      label: 'View',
      href: estimateUrl
    },
    edit: {
      icon: <IcoEdit size={16} />,
      label: 'Edit',
      href: editEstimateUrl
    },
    email: {
      icon: <MailOutlineIcon />,
      label: 'Send Email'
    },
    remove: {
      icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
      label: 'Remove',
      onClick: showConfirmationDialog
    }
  }

  if (!estimateData || !estimateId) return null

  return (
    <Stack
      direction="row"
      justifyContent={{
        xs: 'flex-start',
        md: 'flex-end'
      }}
      alignItems="center"
      gap={1}
      flexWrap={{
        xs: 'wrap',
        md: 'nowrap'
      }}
      whiteSpace="nowrap"
    >
      {(
        Object.keys(buttonDefinitions) as Array<keyof typeof buttonDefinitions>
      ).map((key) => {
        const { icon, label, ...rest } = buttonDefinitions[key]

        if (key === 'email') {
          return (
            <SendEstimateButton
              estimateId={estimateId}
              label={label}
              key={key}
              sx={{
                my: -1
              }}
            />
          )
        }

        return (
          <Button
            key={key}
            variant="text"
            color="secondary"
            sx={{
              my: -1,
              '& .MuiButton-loadingIndicator': {
                color: 'secondary.main'
              }
            }}
            startIcon={icon}
            {...rest}
          >
            {label}
          </Button>
        )
      })}
    </Stack>
  )
}

export default ButtonsBar
