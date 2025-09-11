import React from 'react'

import { Button, TableCell } from '@mui/material'

import IcoImport from '@icons/IcoImport'
import IcoUpdate from '@icons/IcoUpdate'

import type { FubUser } from 'services/API'
import { useAgents } from 'providers/AgentsProvider'

interface ActionCellProps {
  fubUser: FubUser
}

const ActionCell: React.FC<ActionCellProps> = ({ fubUser }) => {
  const { create, update } = useAgents()
  const { repliers, changes } = fubUser

  const getButton = () => {
    if (changes?.length) {
      return (
        <Button
          sx={{ textTransform: 'none' }}
          variant="text"
          color="primary"
          startIcon={<IcoUpdate />}
          onClick={() => update(fubUser)}
        >
          UPDATE
        </Button>
      )
    }

    if (!repliers) {
      return (
        <Button
          variant="text"
          color="primary"
          startIcon={<IcoImport />}
          onClick={() => create(fubUser)}
        >
          IMPORT
        </Button>
      )
    }

    return null
  }

  return (
    <TableCell component="th" scope="fubUser">
      {getButton()}
    </TableCell>
  )
}

export default ActionCell
