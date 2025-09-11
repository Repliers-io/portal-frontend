import { Box, DialogContent, DialogTitle, Stack } from '@mui/material'

import { GoogleAuthButton } from '@shared/Buttons'

import { TermsAndPrivacy } from '.'

const ThirdPartyLoginForm = () => {
  return (
    <>
      <DialogTitle>Sign in</DialogTitle>
      <DialogContent
        sx={{ px: { sm: 8 }, pb: 4, minHeight: 'auto', flexGrow: 0 }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            pt: { xs: 7, sm: 1 },
            mx: 'auto'
          }}
        >
          <Stack spacing={4} alignItems="center" justifyContent="center">
            <GoogleAuthButton />

            <TermsAndPrivacy />
          </Stack>
        </Box>
      </DialogContent>
    </>
  )
}

export default ThirdPartyLoginForm
