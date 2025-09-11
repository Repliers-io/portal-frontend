'use client'

import { useState } from 'react'

import { Button, Typography } from '@mui/material'

import palette from '@configs/theme/palette'
import { Badge } from '@pages/estimate/Banners/components'

import APIFubUser from 'services/API/APIFubUser'
import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { extractErrorMessage } from 'utils/errors'

import { BoxContainer, ImageBanner } from './components'
import SuccessCashOfferDialog from './SuccessCashOfferDialog'

const SpecialOfferBanner = () => {
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const { logged } = useUser()
  const { showDialog: showLogin } = useDialog('auth')

  const [openDialog, setOpenDialog] = useState(false)
  const showSuccessDialog = () => setOpenDialog(true)
  const hideSuccessDialog = () => setOpenDialog(false)

  const addTagsToFubUser = async () => {
    setResponse(null)
    setLoading(true)
    try {
      const response = await APIFubUser.addTags(['cash offer'])
      setResponse(response)
      showSuccessDialog()
    } catch (e) {
      showSnackbar(extractErrorMessage(e), 'error')
    }
    setLoading(false)
  }

  return (
    <>
      <BoxContainer
        flexDirection={{ xs: 'column-reverse', md: 'row' }}
        imgContent={
          <ImageBanner
            src="/justinhavre-avm/home-special-offer.webp"
            alt="Key and house home special offer picture"
          />
        }
        textContent={
          <>
            <Badge text="SPECIAL OFFER" />
            <Typography
              variant="h2"
              my={3}
              color="common.white"
              lineHeight={1.2}
              maxWidth={500}
            >
              Look to Sell Your Home Fast for a Fair Price Cash Offer?
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              loading={loading}
              disabled={response}
              sx={{
                px: 3,
                // disable on a dark background, when successfully added FUB tags
                '&.MuiButton-contained.Mui-disabled': {
                  opacity: 0.5,
                  bgcolor: palette.secondary.main,
                  color: 'common.white'
                }
              }}
              onClick={logged ? addTagsToFubUser : showLogin}
            >
              REQUEST MORE INFORMATION
            </Button>
          </>
        }
      />
      <SuccessCashOfferDialog open={openDialog} onClose={hideSuccessDialog} />
    </>
  )
}

export default SpecialOfferBanner
