import React from 'react'

import { Stack } from '@mui/material'

import listingsConfig from '@configs/listings'
import { ShareButton } from '@shared/Buttons'

import { FallInTransition } from 'components/atoms'

import { useBuilding } from 'providers/BuildingProvider'
import useClientSide from 'hooks/useClientSide'

export const RightSideButtons = ({ sticky }: { sticky: boolean }) => {
  const clientSide = useClientSide()
  const { name } = useBuilding()

  if (!clientSide) return <Stack spacing={1} sx={{ width: 148 }} />

  return listingsConfig.components.share ? (
    <FallInTransition show={sticky}>
      <ShareButton variant="icon" title={name} />
    </FallInTransition>
  ) : null
}
