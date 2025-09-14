import type React from 'react'

import { Stack } from '@mui/material'

import { FallInTransition } from 'components/atoms'

import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'
import useClientSide from 'hooks/useClientSide'

import { FavoritesButton, ShareButton } from '../..'

const RightSideButtons = ({ sticky }: { sticky: boolean }) => {
  const features = useFeatures()
  const { blurred } = useProperty()
  const clientSide = useClientSide()

  if (!clientSide) return <Stack spacing={1} sx={{ width: 148 }} />

  return (
    <Stack
      spacing={1}
      direction="row"
      justifyContent="flex-end"
      sx={{ width: 148 }}
    >
      {!blurred && (
        <>
          {features.pdpShare && (
            <FallInTransition show={sticky}>
              <ShareButton variant="icon" />
            </FallInTransition>
          )}
          {features.favorites && (
            <FallInTransition show={sticky}>
              <FavoritesButton variant="icon" />
            </FallInTransition>
          )}
        </>
      )}
    </Stack>
  )
}

export default RightSideButtons
