import { useRouter } from 'next/navigation'

import { Button, Skeleton } from '@mui/material'

import { WestIcon } from '@configs/icons'

import useClientSide from 'hooks/useClientSide'

export const BackButton = () => {
  const router = useRouter()
  const clientSide = useClientSide()

  const backButton = clientSide && window?.history?.length > 1
  const backToMap =
    clientSide && document.referrer && document.referrer.includes('map')

  return !clientSide ? (
    <Skeleton variant="rounded" sx={{ width: 94.5, height: 44 }} />
  ) : backButton ? (
    <Button
      variant="text"
      startIcon={<WestIcon />}
      href={document.referrer}
      sx={{ height: 44 }}
      onClick={(e) => {
        router.back()
        e.preventDefault()
      }}
    >
      Back {backToMap ? 'to Map' : ''}
    </Button>
  ) : null
}
